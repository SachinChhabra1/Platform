import 'package:flutter/material.dart';
import 'package:nia_api/api.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../../widgets/nia_async.dart';
import 'membership_source.dart';

/// The Member's identity header on the Profile — wired (spec §14, same pattern as
/// the Wallet) to the Membership read model via the generated `nia_api` client.
///
/// He is known by name, not number (§3). It renders the Member's name from the
/// live `MembershipView`; the lifecycle `state` is intentionally NOT shown here
/// (Q2 handled by the standing block). Tenure is internal (FD-3, Q4). The default
/// source is the Founder-accepted sample (this is a prototype).
///
/// Async state model (R9): a placeholder identity while loading, the real name on
/// success, and — on a failed fetch — a calm recoverable error (via [NiaAsyncView])
/// instead of a name that is stuck on `…` forever.
class MembershipHeader extends StatelessWidget {
  const MembershipHeader({super.key, this.source = const SampleMembershipSource()});

  final MembershipSource source;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return NiaAsyncView<MembershipView>(
      load: source.currentMembership,
      // Loading keeps the progressive placeholder (monogram + '…'), unchanged.
      loading: _row(theme, name: '…', initials: 'R'),
      builder: (BuildContext context, MembershipView m) => _row(
        theme,
        name: m.name.isEmpty ? '…' : m.name,
        initials: m.name.isNotEmpty ? m.name.substring(0, 1) : 'R',
      ),
    );
  }

  Widget _row(ThemeData theme, {required String name, required String initials}) {
    return Row(
      children: <Widget>[
        Monogram(initials: initials, size: 64),
        const SizedBox(width: NiaTokens.s4),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(name, style: theme.textTheme.titleLarge),
              const SizedBox(height: NiaTokens.s1),
              Text('A Member of Nia', style: theme.textTheme.bodySmall),
            ],
          ),
        ),
      ],
    );
  }
}
