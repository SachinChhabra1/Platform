/// Nia Member-facing localization.
///
/// All Member-facing copy lives in this package (CLAUDE.md §12). Supported
/// languages (Book III §5.2): Hindi, Odia, Bengali, Tamil, Telugu, Kannada, with
/// English as the fallback. Numerals render in the Member's script by default
/// (Book III §5.3).
///
/// Consumers use [NiaLocalizations.localizationsDelegates] and
/// [NiaLocalizations.supportedLocales] when configuring their app, and
/// `NiaLocalizations.of(context)` to read strings.
library;

export 'src/generated/nia_localizations.dart';
