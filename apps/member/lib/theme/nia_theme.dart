import 'package:flutter/material.dart';

import 'nia_tokens.dart';

/// PROTOTYPE theme — composes [NiaTokens] into Material 3 following Book III.
///
/// One typeface family, stepped sizes, display larger than the industry default
/// because the Member reads in motion, in poor light, with one hand (Book III
/// §2.2); generous space (§2.3); monochrome ground (§2.1). Production theming
/// comes from `packages/tokens` once it exists (ADR-0003); this is local to the
/// prototype.
ThemeData buildNiaPrototypeTheme() {
  const ink = NiaTokens.ink;
  const secondary = NiaTokens.inkSecondary;

  final base = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: NiaTokens.ground,
    colorScheme: ColorScheme.fromSeed(
      seedColor: NiaTokens.navy,
      brightness: Brightness.light,
    ).copyWith(
      primary: ink,
      onPrimary: NiaTokens.ground,
      surface: NiaTokens.ground,
      onSurface: ink,
      error: NiaTokens.red,
    ),
  );

  // Stepped type scale (Book III §2.2). One family (the base family); only
  // weight and size vary.
  final text = base.textTheme.copyWith(
    displaySmall: const TextStyle(
        fontSize: 40, fontWeight: FontWeight.w600, color: ink, height: 1.1),
    headlineMedium: const TextStyle(
        fontSize: 30, fontWeight: FontWeight.w600, color: ink, height: 1.15),
    titleLarge: const TextStyle(
        fontSize: 22, fontWeight: FontWeight.w600, color: ink),
    bodyLarge: const TextStyle(
        fontSize: 18, fontWeight: FontWeight.w400, color: ink, height: 1.4),
    bodyMedium: const TextStyle(
        fontSize: 16, fontWeight: FontWeight.w400, color: secondary, height: 1.4),
    labelLarge: const TextStyle(
        fontSize: 14, fontWeight: FontWeight.w600, color: ink),
    bodySmall: const TextStyle(
        fontSize: 14, fontWeight: FontWeight.w400, color: secondary),
  );

  return base.copyWith(
    textTheme: text,
    appBarTheme: const AppBarTheme(
      backgroundColor: NiaTokens.ground,
      foregroundColor: ink,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
    ),
    dividerTheme: const DividerThemeData(
        color: NiaTokens.hairline, thickness: 1, space: 1),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: NiaTokens.ground,
      indicatorColor: const Color(0x14000000),
      elevation: 0,
      height: 64,
      labelTextStyle: WidgetStatePropertyAll(text.bodySmall),
    ),
  );
}
