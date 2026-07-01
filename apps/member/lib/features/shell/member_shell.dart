import 'package:flutter/material.dart';

import '../../config/member_config.dart';
import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../../widgets/nia_bottom_nav.dart';
import '../family/my_family_page.dart';
import '../home/home_page.dart';
import '../profile/profile_page.dart';
import '../wallet/wallet_page.dart';

/// The Member App shell — four anchors that persist across the app, icon-first
/// (Book IV §3.2: four fit the thumb). The Developer Preview centres the live,
/// Member-facing surfaces: **Home · Wallet · Family · Profile**. Navigation is
/// icons, not words — the selected tab shows a solid icon + a short label; the
/// rest are quiet grey line icons ([NiaBottomNav]).
///
/// The anchors switch via an [IndexedStack] so each tab keeps its place; the
/// Operator is one tap from any screen (§3.6, the app-bar action).
class MemberShell extends StatefulWidget {
  const MemberShell({super.key, this.config = const MemberConfig.fromEnvironment()});

  /// Selects live HTTP vs. offline-sample sources for the data-bearing screens.
  final MemberConfig config;

  @override
  State<MemberShell> createState() => _MemberShellState();
}

class _MemberShellState extends State<MemberShell> {
  int _index = 0;

  // Sources built once from the configuration (live or sample) and shared by the
  // screens that read them.
  late final _wallet = widget.config.walletSource();
  late final _membership = widget.config.membershipSource();

  late final List<Widget> _pages = <Widget>[
    HomePage(
      walletSource: _wallet,
      membershipSource: _membership,
      onOpenFamily: () => setState(() => _index = 2),
    ),
    WalletPage(source: _wallet),
    MyFamilyPage(walletSource: _wallet),
    ProfilePage(
      membershipSource: _membership,
      previewMode: widget.config.usesLiveBackend,
    ),
  ];

  // Home greets in-body, so its app-bar title is empty. The Wallet tab is now
  // named NiaBook and Profile is Me (labels only; the NiaBook redesign is a
  // later Product-Polish slice — the screens are unchanged here).
  static const List<String> _titles = <String>['', 'NiaBook', 'My Family', 'Me'];

  static const List<NiaNavItem> _navItems = <NiaNavItem>[
    NiaNavItem(icon: Icons.home_outlined, selectedIcon: Icons.home, label: 'Home'),
    NiaNavItem(
        icon: Icons.account_balance_wallet_outlined,
        selectedIcon: Icons.account_balance_wallet,
        label: 'NiaBook'),
    NiaNavItem(icon: Icons.people_outline, selectedIcon: Icons.people, label: 'Family'),
    NiaNavItem(icon: Icons.person_outline, selectedIcon: Icons.person, label: 'Me'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: NiaTokens.s5,
        title: Text(_titles[_index]),
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
      bottomNavigationBar: NiaBottomNav(
        index: _index,
        items: _navItems,
        onSelect: (int i) => setState(() => _index = i),
      ),
    );
  }
}
