import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/widgets/common.dart';

/// Coverage for the shared building blocks in `widgets/common.dart` — the
/// Monogram avatar, the honest prototype no-op, and the SOS → Nia Emergency
/// entry point. These are used across the app and had no direct test.

Widget _host(Widget child) => MaterialApp(home: Scaffold(body: Center(child: child)));

/// A button that invokes [onTap] with a real BuildContext under a Scaffold, so
/// the ScaffoldMessenger / modal routes resolve.
Widget _tapHost(void Function(BuildContext) onTap) => MaterialApp(
      home: Scaffold(
        body: Builder(
          builder: (BuildContext context) => Center(
            child: ElevatedButton(
              onPressed: () => onTap(context),
              child: const Text('go'),
            ),
          ),
        ),
      ),
    );

void main() {
  testWidgets('Monogram renders its initials', (WidgetTester t) async {
    await t.pumpWidget(_host(const Monogram(initials: 'R', size: 44)));
    expect(find.text('R'), findsOneWidget);
  });

  testWidgets('SectionLabel renders its text', (WidgetTester t) async {
    await t.pumpWidget(_host(const SectionLabel('Your Operator')));
    expect(find.text('Your Operator'), findsOneWidget);
  });

  testWidgets('prototypeNoOp shows the honest no-op snackbar', (WidgetTester t) async {
    await t.pumpWidget(_tapHost((BuildContext c) => prototypeNoOp(c, 'Machine Operator II')));
    await t.tap(find.text('go'));
    await t.pump(); // let the snackbar appear
    expect(find.textContaining('no behaviour in the prototype'), findsOneWidget);
    expect(find.textContaining('Machine Operator II'), findsOneWidget);
  });

  testWidgets('openNiaEmergency opens the Operator sheet (SOS routing)',
      (WidgetTester t) async {
    await t.pumpWidget(_tapHost((BuildContext c) => openNiaEmergency(c)));
    await t.tap(find.text('go'));
    await t.pumpAndSettle();
    expect(find.text('Your Operator'), findsOneWidget);
    expect(find.textContaining('Call'), findsWidgets); // "Call <operator>"
  });
}
