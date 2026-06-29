import 'package:flutter/material.dart';

import '../../routing/app_routes.dart';

/// Placeholder Home route.
///
/// No real content, no Member greeting, no Wallet/Membership behaviour. It
/// exists only to prove the shell boots and can route. The real Home is
/// Book VII screen 3.1, built from a locked spec.
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text('Home — placeholder'),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () =>
                  Navigator.of(context).pushNamed(AppRoutes.wallet),
              child: const Text('Go to Wallet'),
            ),
          ],
        ),
      ),
    );
  }
}
