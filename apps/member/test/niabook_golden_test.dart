import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/niabook/niabook_page.dart';

/// Screenshot harness for the board demo. Renders the approved two-column
/// NiaBook to `goldens/niabook.png` with real fonts + icons, so the capture is
/// legible. Regenerate with:
///   flutter test test/niabook_golden_test.dart --update-goldens
/// A demo artefact, not an assertion.

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

void main() {
  setUpAll(_loadFonts);

  testWidgets('NiaBook — approved two-column design', (WidgetTester tester) async {
    // Logical 390 x 1400 (a real phone width) at 3x for a crisp capture.
    tester.view.physicalSize = const Size(1170, 4200);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData(fontFamily: 'AppFont'),
        home: const Scaffold(
          backgroundColor: Color(0xFFFFFFFF),
          body: SafeArea(child: NiaBookPage()),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await expectLater(
      find.byType(NiaBookPage),
      matchesGoldenFile('goldens/niabook.png'),
    );
  });
}
