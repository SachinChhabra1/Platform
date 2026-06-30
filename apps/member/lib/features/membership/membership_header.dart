import 'package:flutter/material.dart';
import 'package:nia_api/api.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import 'membership_source.dart';

/// The Member's identity header on the Profile — wired (spec §14, same pattern as
/// the Wallet) to the Membership read model via the generated `nia_api` client.
///
/// He is known by name, not number (§3). It renders the Member's name from the
/// live `MembershipView`; the lifecycle `state` is intentionally NOT shown — that
/// is an open Product debate (Q2, "not shown until decided"), preserved as a
/// marked placeholder elsewhere on the Profile. Tenure is internal (FD-3, Q4).
/// The default source is the Founder-accepted sample (this is a prototype).
class MembershipHeader extends StatefulWidget {
  const MembershipHeader({super.key, this.source = const SampleMembershipSource()});

  final MembershipSource source;

  @override
  State<MembershipHeader> createState() => _MembershipHeaderState();
}

class _MembershipHeaderState extends State<MembershipHeader> {
  late final Future<MembershipView> _membership = widget.source.currentMembership();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return FutureBuilder<MembershipView>(
      future: _membership,
      builder: (BuildContext context, AsyncSnapshot<MembershipView> snap) {
        final String name = snap.data?.name ?? '';
        final String initials = name.isNotEmpty ? name.substring(0, 1) : 'R';
        return Row(
          children: <Widget>[
            Monogram(initials: initials, size: 64),
            const SizedBox(width: NiaTokens.s4),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(name.isEmpty ? '…' : name,
                      style: theme.textTheme.titleLarge),
                  const SizedBox(height: NiaTokens.s1),
                  Text('A Member of Nia', style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}
