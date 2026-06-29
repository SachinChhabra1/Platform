import 'package:flutter/material.dart';
import 'package:nia_i18n/nia_i18n.dart';

import 'routing/app_router.dart';
import 'routing/app_routes.dart';

/// The Member App shell.
///
/// Routing, scaffolding, and localization wiring only. No Membership or Wallet
/// behaviour, no real screens, no API calls, no auth. Real screens and theming
/// arrive from Engineering-Locked Product Specifications (the contract chain,
/// ADR-0009).
class NiaMemberApp extends StatelessWidget {
  const NiaMemberApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      onGenerateTitle: (context) => NiaLocalizations.of(context).appTitle,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true),
      localizationsDelegates: NiaLocalizations.localizationsDelegates,
      supportedLocales: NiaLocalizations.supportedLocales,
      initialRoute: AppRoutes.home,
      onGenerateRoute: AppRouter.onGenerateRoute,
    );
  }
}
