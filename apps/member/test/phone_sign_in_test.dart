import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/auth/phone_sign_in_page.dart';
import 'package:member/features/auth/session_source.dart';

/// Phone sign-in — the front of the chain. It issues a session for the entered
/// phone + this device and hands the token on; an unrecognised number is refused
/// with a way to a person (the Operator). The fake source keeps it off the wire.

class _FakeSession implements SessionSource {
  _FakeSession(this._token, {this.fail = false});
  final String _token;
  final bool fail;
  String? phone;
  String? deviceId;

  @override
  Future<String> issue({required String phone, required String deviceId}) async {
    this.phone = phone;
    this.deviceId = deviceId;
    if (fail) throw StateError('unrecognised');
    return _token;
  }
}

void main() {
  testWidgets('issues a session for the entered phone + this device and hands on the token',
      (WidgetTester tester) async {
    final fake = _FakeSession('sess-abc');
    String? handed;
    await tester.pumpWidget(MaterialApp(
      home: PhoneSignInPage(
        baseUrl: 'http://127.0.0.1:8080',
        defaultPhone: '+919800000001',
        sessionSource: fake,
        onSession: (String t) => handed = t,
      ),
    ));

    await tester.tap(find.text('Continue'));
    // Not pumpAndSettle: on success the real flow navigates away; with an
    // onSession callback the page stays with its progress spinner, which never
    // settles. Pump enough to resolve the issue() future.
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));

    expect(fake.phone, '+919800000001');
    expect(fake.deviceId, 'dev-preview-web');
    expect(handed, 'sess-abc');
  });

  testWidgets('an unrecognised number is refused, with the Operator offered',
      (WidgetTester tester) async {
    final fake = _FakeSession('', fail: true);
    String? handed;
    await tester.pumpWidget(MaterialApp(
      home: PhoneSignInPage(
        baseUrl: 'http://127.0.0.1:8080',
        defaultPhone: '+910000000000',
        sessionSource: fake,
        onSession: (String t) => handed = t,
      ),
    ));

    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();

    expect(handed, isNull);
    expect(find.textContaining("don't recognise that number"), findsOneWidget);
    expect(find.text('Talk to your Operator'), findsOneWidget);
  });
}
