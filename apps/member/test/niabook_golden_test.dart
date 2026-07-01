import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/niabook/niabook_page.dart';
import 'package:member/features/niabook/niabook_scenario.dart';

/// Screenshot harness for the board demo. Renders the NiaBook default page and
/// each of the five states to `goldens/*.png` with the real system font, so the
/// captures are legible. Regenerate with:
///   flutter test test/niabook_golden_test.dart --update-goldens
/// These are demo artefacts, not assertions.

Future<void> _loadFromFirst(String family, List<String> candidates) async {
  for (final path in candidates) {
    final file = File(path);
    if (file.existsSync()) {
      final Uint8List bytes = file.readAsBytesSync();
      final loader = FontLoader(family)
        ..addFont(Future<ByteData>.value(ByteData.view(bytes.buffer)));
      await loader.load();
      return;
    }
  }
}

// Load real fonts so goldens render legible text and icons instead of
// flutter_test's placeholder boxes: San Francisco for the type, and the
// MaterialIcons glyphs for the story icons.
Future<void> _loadFonts() async {
  final String home = Platform.environment['HOME'] ?? '';
  await _loadFromFirst('AppFont', <String>[
    '/System/Library/Fonts/SFNS.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
  ]);
  await _loadFromFirst('MaterialIcons', <String>[
    '$home/Developer/Nia Development/toolchain/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf',
    '../../../toolchain/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf',
  ]);
}

Future<void> _shoot(WidgetTester tester, int stateIndex, String name) async {
  tester.view.physicalSize = const Size(400, 4200);
  tester.view.devicePixelRatio = 2.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  final states = <NiaBookMonth>[NiaBookMonth.demoStates[stateIndex]];
  await tester.pumpWidget(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(fontFamily: 'AppFont'),
      home: Scaffold(
        backgroundColor: const Color(0xFFFFFFFF),
        body: NiaBookPage(states: states),
      ),
    ),
  );
  await tester.pumpAndSettle();
  await expectLater(
    find.byType(NiaBookPage),
    matchesGoldenFile('goldens/$name.png'),
  );
}

void main() {
  setUpAll(_loadFonts);

  testWidgets('01 default (Sukh Store savings)', (t) => _shoot(t, 0, 'niabook_01_default'));
  testWidgets('02 unused voucher', (t) => _shoot(t, 1, 'niabook_02_unused_voucher'));
  testWidgets('03 redeemed voucher', (t) => _shoot(t, 2, 'niabook_03_redeemed_voucher'));
  testWidgets('04 no shopping savings', (t) => _shoot(t, 3, 'niabook_04_no_savings'));
  testWidgets('05 no work through Nia', (t) => _shoot(t, 4, 'niabook_05_no_nia_work'));
}
