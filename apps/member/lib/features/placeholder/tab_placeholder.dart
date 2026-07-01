import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';

/// A quiet placeholder for a secondary tab whose screen is not built yet. The
/// approved slice is NiaBook; Work, Living, and Store are anchors in the nav that
/// come later (they are not polished for this demo).
class TabPlaceholder extends StatelessWidget {
  const TabPlaceholder({super.key, required this.title, required this.icon});

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 40, color: NiaTokens.inkSecondary),
          const SizedBox(height: NiaTokens.s3),
          Text(title,
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: NiaTokens.ink)),
          const SizedBox(height: NiaTokens.s2),
          const Text('Coming soon',
              style: TextStyle(fontSize: 14, color: NiaTokens.inkSecondary)),
        ],
      ),
    );
  }
}
