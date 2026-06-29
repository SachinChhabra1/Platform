import 'package:flutter/material.dart';
import 'package:nia_i18n/nia_i18n.dart';

import 'features/shell/member_shell.dart';
import 'theme/nia_theme.dart';

/// The Member App — running as a **Product Review Prototype** (docs/methodology.md
/// → Product Review Prototypes). It compiles, runs, and navigates so Founder and
/// Product can review the *experience* while the Membership spec is still
/// evolving.
///
/// It deliberately contains no backend, no API calls, no Wallet logic, and no
/// product behaviour; every figure is placeholder and every unresolved Founder
/// Decision is shown as a marked placeholder, never invented. Production code
/// still derives only from an Engineering-Locked spec (the contract chain,
/// ADR-0009).
class NiaMemberApp extends StatelessWidget {
  const NiaMemberApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      onGenerateTitle: (context) => NiaLocalizations.of(context).appTitle,
      debugShowCheckedModeBanner: false,
      theme: buildNiaPrototypeTheme(),
      localizationsDelegates: NiaLocalizations.localizationsDelegates,
      supportedLocales: NiaLocalizations.supportedLocales,
      home: const MemberShell(),
    );
  }
}
