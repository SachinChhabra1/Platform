import 'package:flutter/material.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';

/// The third anchor — Living · Work · Essentials, the three clusters that sit
/// above Membership (Book IV §1.2, §3.2). A single anchor that fans out to the
/// three; there is no fourth cluster.
///
/// Each cluster is its own future session and its own locked spec, so here they
/// are marked placeholders, not built surfaces.
class ClustersPage extends StatelessWidget {
  const ClustersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5, NiaTokens.s5, NiaTokens.s5, NiaTokens.s8),
      children: const <Widget>[
        SectionLabel('The three clusters'),
        _Cluster(
          icon: Icons.bed_outlined,
          title: 'Living',
          subtitle: 'Where the Member sleeps and eats.',
        ),
        Divider(),
        _Cluster(
          icon: Icons.work_outline,
          title: 'Work',
          subtitle: 'How the Member earns.',
        ),
        Divider(),
        _Cluster(
          icon: Icons.local_mall_outlined,
          title: 'Essentials',
          subtitle: 'Everything else — including remittance, savings, health.',
        ),
        SizedBox(height: NiaTokens.s7),
        FdPlaceholder(
          code: 'Out of scope',
          label:
              'The clusters are separate specs and later sessions. This anchor completes the navigation model (Book IV §3.2); no cluster behaviour is built in this prototype.',
        ),
      ],
    );
  }
}

class _Cluster extends StatelessWidget {
  const _Cluster(
      {required this.icon, required this.title, required this.subtitle});

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: NiaTokens.s4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(icon, size: 24, color: NiaTokens.ink),
          const SizedBox(width: NiaTokens.s4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title, style: theme.textTheme.titleLarge),
                const SizedBox(height: NiaTokens.s1),
                Text(subtitle, style: theme.textTheme.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
