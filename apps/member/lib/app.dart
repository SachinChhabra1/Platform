import 'package:flutter/material.dart';
import 'package:nia_i18n/nia_i18n.dart';

import 'config/member_config.dart';
import 'features/shell/member_shell.dart';
import 'theme/nia_theme.dart';

/// The Member App — running as a **Product Review Prototype** (docs/methodology.md
/// → Product Review Prototypes). It compiles, runs, and navigates so Founder and
/// Product can review the *experience* while the Membership spec is still
/// evolving.
///
/// By default it runs offline — every figure is the Founder-accepted sample and
/// every unresolved Founder Decision is shown as a marked placeholder, never
/// invented. When a backend is configured (`--dart-define NIA_API_BASE_URL=…`),
/// the data-bearing screens instead read the live `/v1` HTTP surfaces through the
/// generated `nia_api` client ([MemberConfig]); the experience is unchanged.
/// Production code still derives only from an Engineering-Locked spec (the
/// contract chain, ADR-0009).
class NiaMemberApp extends StatelessWidget {
  const NiaMemberApp({super.key, this.config = const MemberConfig.fromEnvironment()});

  /// Chooses live HTTP sources vs. the offline sample. Defaults to the
  /// compile-time configuration; injectable in tests.
  final MemberConfig config;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      onGenerateTitle: (context) => NiaLocalizations.of(context).appTitle,
      debugShowCheckedModeBanner: false,
      theme: buildNiaPrototypeTheme(),
      localizationsDelegates: NiaLocalizations.localizationsDelegates,
      supportedLocales: NiaLocalizations.supportedLocales,
      home: MemberShell(config: config),
    );
  }
}
