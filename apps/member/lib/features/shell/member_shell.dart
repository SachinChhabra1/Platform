import 'package:flutter/material.dart';

import '../../config/member_config.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/nia_bottom_nav.dart';
import '../niabook/niabook_page.dart';
import '../pillars/family_page.dart';
import '../pillars/living_page.dart';
import '../pillars/store_page.dart';
import '../pillars/work_page.dart';

/// The Member App shell — five anchors, icon-first (Book IV §3.2). **NiaBook is
/// the first screen** and owns its own header (title, language, identity, SOS),
/// so the shell is full-bleed with no app bar. The anchors are **NiaBook · Work ·
/// Living · Store · Family**. Selection is the restrained blue; the rest are
/// quiet grey line icons ([NiaBottomNav]).
class MemberShell extends StatefulWidget {
  const MemberShell({super.key, this.config = const MemberConfig.fromEnvironment()});

  final MemberConfig config;

  @override
  State<MemberShell> createState() => _MemberShellState();
}

class _MemberShellState extends State<MemberShell> {
  int _index = 0;

  // The five screens. NiaBook renders live facts + derived story from the
  // config-selected source (sample offline, live when a backend is configured);
  // the four pillars are still self-contained scenarios in this slice.
  List<Widget> get _pages => <Widget>[
        NiaBookPage(source: widget.config.homeSource()),
        const WorkPage(),
        const LivingPage(),
        const StorePage(),
        const FamilyPage(),
      ];

  static const List<NiaNavItem> _navItems = <NiaNavItem>[
    NiaNavItem(
        icon: Icons.menu_book_outlined,
        selectedIcon: Icons.menu_book,
        label: 'NiaBook'),
    NiaNavItem(icon: Icons.work_outline, selectedIcon: Icons.work, label: 'Work'),
    NiaNavItem(
        icon: Icons.home_outlined, selectedIcon: Icons.home, label: 'Living'),
    NiaNavItem(
        icon: Icons.shopping_bag_outlined,
        selectedIcon: Icons.shopping_bag,
        label: 'Store'),
    NiaNavItem(
        icon: Icons.favorite_border,
        selectedIcon: Icons.favorite,
        label: 'Family'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NiaTokens.ground,
      body: SafeArea(child: IndexedStack(index: _index, children: _pages)),
      bottomNavigationBar: NiaBottomNav(
        index: _index,
        items: _navItems,
        onSelect: (int i) => setState(() => _index = i),
      ),
    );
  }
}
