import 'package:flutter/material.dart';

import '../../config/member_config.dart';
import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../clusters/clusters_page.dart';
import '../home/home_page.dart';
import '../profile/profile_page.dart';
import '../rafiqi/rafiqi_page.dart';
import '../wallet/wallet_page.dart';

/// The Member App shell — the four anchors that persist across the app
/// (Book IV §3.2): Home · Wallet · Living·Work·Essentials · RafiQi. Four fit
/// the thumb; a fifth would break the model.
///
/// The Home has no back (§3.3); the anchors switch via an [IndexedStack] so
/// each tab keeps its place. The Operator is reachable in one tap from any
/// screen (§3.6), and the Member's profile is one tap from the header.
class MemberShell extends StatefulWidget {
  const MemberShell({super.key, this.config = const MemberConfig.fromEnvironment()});

  /// Selects live HTTP vs. offline-sample sources for the data-bearing screens.
  final MemberConfig config;

  @override
  State<MemberShell> createState() => _MemberShellState();
}

class _MemberShellState extends State<MemberShell> {
  int _index = 0;

  // Built once from the configuration: the Home and Wallet read their sources
  // (live or sample) per [MemberConfig]; the other anchors carry no Member data.
  // In Preview (a live backend) the Home surfaces the Member's standing (Q2).
  late final List<Widget> _pages = <Widget>[
    HomePage(
      walletSource: widget.config.walletSource(),
      membershipSource: widget.config.membershipSource(),
    ),
    WalletPage(source: widget.config.walletSource()),
    const ClustersPage(),
    const RafiqiPage(),
  ];

  static const List<String> _titles = <String>[
    '', // Home leads with a greeting in-body, not an app-bar title.
    'My Wallet',
    'Living · Work · Essentials',
    'RafiQi',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: NiaTokens.s5,
        title: Text(_titles[_index]),
        leadingWidth: 64,
        leading: Padding(
          padding: const EdgeInsets.only(left: NiaTokens.s4),
          child: IconButton(
            tooltip: 'Profile',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) => ProfilePage(
                  membershipSource: widget.config.membershipSource(),
                  previewMode: widget.config.usesLiveBackend,
                ),
              ),
            ),
            icon: const Monogram(initials: 'R', size: 36),
          ),
        ),
        actions: <Widget>[
          Center(child: PrototypeChip(label: widget.config.usesLiveBackend ? 'preview' : 'prototype')),
          IconButton(
            tooltip: 'Call your Operator',
            onPressed: () => openOperatorSheet(context),
            icon: const Icon(Icons.headset_mic_outlined),
          ),
          const SizedBox(width: NiaTokens.s2),
        ],
      ),
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (int i) => setState(() => _index = i),
        destinations: const <NavigationDestination>[
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_outlined),
            selectedIcon: Icon(Icons.account_balance_wallet),
            label: 'Wallet',
          ),
          NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view),
            label: 'Clusters',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_awesome_outlined),
            selectedIcon: Icon(Icons.auto_awesome),
            label: 'RafiQi',
          ),
        ],
      ),
    );
  }
}
