import 'package:flutter/material.dart';

/// PROTOTYPE-LOCAL design tokens — Book III §2 (Colour, Type, Space).
///
/// These mirror Book III's visual system so the Product Review Prototype is
/// *grounded in the books, not invented*. They are intentionally local to this
/// app: the production single source of truth is `packages/tokens` (Book VI,
/// ADR-0003), which is not built yet. When it lands, this file is deleted and
/// the theme reads from tokens. Do not treat these literals as the production
/// palette.
abstract final class NiaTokens {
  // ── Colour ─────────────────────────────────────────────────────────────
  // Monochrome by default; colour carries meaning only (Book III §2.1).
  static const Color ground = Color(0xFFFFFFFF); // default white ground
  static const Color ink = Color(0xFF111111); // near-black, primary ink
  static const Color inkSecondary = Color(0xFF6B6B6B); // mid-grey secondary ink
  static const Color hairline = Color(0xFFE6E6E3); // quiet separators

  // Restrained blue — the NiaBook accent (Nia Design System v2.1 --nia-blue).
  // Used for headings, money accents, links, selected nav; never as a fill wash.
  static const Color blue = Color(0xFF2C5880);
  static const Color blueTint = Color(0xFFEAF0F5); // faint blue chip / hero tint
  static const Color surfaceGrey = Color(0xFFF3F4F5); // soft grey card fill

  // The four reserved meaning-colours (Book III §2.1). Meaning only.
  static const Color navy = Color(0xFF1B2A4A); // Nia at scale / institutional
  static const Color green = Color(0xFF1E8E5A); // savings growth, remittance success
  static const Color amber = Color(0xFFB8730A); // attention required
  static const Color red = Color(0xFFB3261E); // failure and danger

  // Faint tints (prototype only) for placeholder markers — never product chrome.
  static const Color amberTint = Color(0x14B8730A);

  // ── Space ──────────────────────────────────────────────────────────────
  // Space is spent generously; stepped, not continuous (Book III §2.3).
  static const double s1 = 4;
  static const double s2 = 8;
  static const double s3 = 12;
  static const double s4 = 16;
  static const double s5 = 24;
  static const double s6 = 32;
  static const double s7 = 48;
  static const double s8 = 64;

  static const double radius = 12;
}
