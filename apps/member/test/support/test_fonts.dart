import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

/// Loads the real system font (San Francisco) and the Material icon glyphs into
/// the test binding, so widget/golden tests measure text with production metrics
/// instead of flutter_test's placeholder font. Use with a theme `fontFamily:
/// 'AppFont'` so the loaded font is the default. Register via `setUpAll`.
Future<void> loadRealFonts() async {
  await _loadFromFirst('AppFont', <String>[
    '/System/Library/Fonts/SFNS.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
  ]);
  final String home = Platform.environment['HOME'] ?? '';
  await _loadFromFirst('MaterialIcons', <String>[
    '$home/Developer/Nia Development/toolchain/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf',
    '../../../toolchain/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf',
  ]);
}

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
