import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/niabook/niabook_page.dart';
import 'package:member/features/pillars/family_page.dart';
import 'package:member/features/pillars/living_page.dart';
import 'package:member/features/pillars/store_page.dart';
import 'package:member/features/pillars/work_page.dart';

/// Screenshot harness for the board demo. Renders the five approved screens
/// (NiaBook + the four pillars) to `goldens/*.png` with real fonts + icons.
/// Regenerate with:
///   flutter test test/niabook_golden_test.dart --update-goldens
/// Demo artefacts, not assertions.

Future<void> _loadFromFirst(String family, List<String> candidates) async {
  for (final path in candidates) {
    final file = File(path);
    if (file.existsSync()) {
      final bytes = file.readAsBytesSync();
      final loader = FontLoader(family)
        ..addFont(Future<ByteData>.value(ByteData.view(bytes.buffer)));
      await loader.load();
      return;
    }
  }
}

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

Future<void> _shoot(WidgetTester tester, Widget page, String name) async {
  // Logical 390 x 1600 (a real phone width) at 3x for a crisp capture.
  tester.view.physicalSize = const Size(1170, 4800);
  tester.view.devicePixelRatio = 3.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  await tester.pumpWidget(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(fontFamily: 'AppFont'),
      home: Scaffold(
        backgroundColor: const Color(0xFFFFFFFF),
        body: SafeArea(child: page),
      ),
    ),
  );
  await tester.pumpAndSettle();
  await expectLater(find.byType(page.runtimeType),
      matchesGoldenFile('goldens/$name.png'));
}

void main() {
  setUpAll(_loadFonts);

  testWidgets('NiaBook', (t) => _shoot(t, const NiaBookPage(), 'niabook'));
  testWidgets('Work', (t) => _shoot(t, const WorkPage(), 'work'));
  testWidgets('Living', (t) => _shoot(t, const LivingPage(), 'living'));
  testWidgets('Store', (t) => _shoot(t, const StorePage(), 'store'));
  testWidgets('Family', (t) => _shoot(t, const FamilyPage(), 'family'));
}
