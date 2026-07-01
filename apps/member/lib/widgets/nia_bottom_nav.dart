import 'package:flutter/material.dart';

import '../theme/nia_tokens.dart';

/// One destination in the Member app's bottom navigation.
class NiaNavItem {
  const NiaNavItem({
    required this.icon,
    required this.selectedIcon,
    required this.label,
  });

  /// The quiet, line icon shown when the tab is not selected.
  final IconData icon;

  /// The solid icon shown when the tab is selected.
  final IconData selectedIcon;

  /// Short label — shown only on the selected tab (and as the accessible name).
  final String label;
}

/// The Member app's bottom navigation — icon-first and mobile-native.
///
/// Book III (monochrome by default; colour carries meaning only): selection is
/// weight and near-black ink, not a colour. The selected tab shows a solid icon
/// + a short label; the others are a quiet grey line icon only, so the bar reads
/// at a glance instead of as a wall of words. Every tab carries its label as a
/// tooltip / accessible name. Four tabs fit the thumb (Book IV §3.2).
class NiaBottomNav extends StatelessWidget {
  const NiaBottomNav({
    super.key,
    required this.index,
    required this.items,
    required this.onSelect,
  });

  final int index;
  final List<NiaNavItem> items;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: NiaTokens.ground,
        border: Border(top: BorderSide(color: NiaTokens.hairline)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60,
          child: Row(
            children: <Widget>[
              for (int i = 0; i < items.length; i++)
                Expanded(child: _Tab(item: items[i], selected: i == index, onTap: () => onSelect(i))),
            ],
          ),
        ),
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({required this.item, required this.selected, required this.onTap});

  final NiaNavItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final Color color = selected ? NiaTokens.ink : NiaTokens.inkSecondary;
    return Semantics(
      button: true,
      selected: selected,
      label: item.label,
      child: Tooltip(
        message: item.label,
        child: InkWell(
          onTap: onTap,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Icon(selected ? item.selectedIcon : item.icon, size: 24, color: color),
              const SizedBox(height: 2),
              // A minimal label, only on the selected tab (the others stay
              // icon-first and quiet). The 14px slot is always reserved so the
              // icons don't shift when selection moves.
              SizedBox(
                height: 14,
                child: selected
                    ? Text(item.label,
                        style: const TextStyle(
                          fontSize: 11,
                          height: 1.0,
                          fontWeight: FontWeight.w600,
                          color: NiaTokens.ink,
                        ))
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
