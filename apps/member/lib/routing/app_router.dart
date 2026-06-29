import 'package:flutter/material.dart';

import '../features/home/home_page.dart';
import '../features/wallet/wallet_page.dart';
import 'app_routes.dart';

/// The routing shell: maps route names to placeholder pages.
///
/// No guards, no auth, no deep links yet. Real navigation behaviour arrives
/// from Engineering-Locked Product Specifications.
abstract final class AppRouter {
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.home:
        return MaterialPageRoute<void>(
          builder: (_) => const HomePage(),
          settings: settings,
        );
      case AppRoutes.wallet:
        return MaterialPageRoute<void>(
          builder: (_) => const WalletPage(),
          settings: settings,
        );
      default:
        return MaterialPageRoute<void>(
          builder: (_) => const _UnknownRoutePage(),
          settings: settings,
        );
    }
  }
}

class _UnknownRoutePage extends StatelessWidget {
  const _UnknownRoutePage();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Route not found')),
    );
  }
}
