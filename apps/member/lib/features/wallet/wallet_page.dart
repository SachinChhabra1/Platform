import 'package:flutter/material.dart';

/// Placeholder Wallet route.
///
/// No balance, no transactions, no Wallet behaviour. The real Wallet Overview
/// is Book VII screens 4.1/4.2 (the first production vertical slice, ADR-0008),
/// built from a locked spec.
class WalletPage extends StatelessWidget {
  const WalletPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: const Center(child: Text('Wallet — placeholder')),
    );
  }
}
