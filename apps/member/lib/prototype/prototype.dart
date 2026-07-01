/// Shared scaffolding for the Product Review Prototype.
///
/// This file exists ONLY because this app is a Product Review Prototype — a
/// thinking tool, not production software (docs/methodology.md → Product Review
/// Prototypes). It provides three things:
///   1. an unmistakable "this is a prototype" marker;
///   2. a way to render an unresolved Founder Decision as an explicit
///      placeholder instead of invented behaviour;
///   3. placeholder data (no backend, no API, not a contract).
library;

import 'package:flutter/material.dart';

import '../theme/nia_tokens.dart';

/// A small, quiet marker that this is a prototype — minimised in Iteration 2
/// (Founder direction) from the old full-width ribbon to an unobtrusive chip
/// that sits in the app bar. Still unmistakable on inspection; no longer noise.
class PrototypeChip extends StatelessWidget {
  const PrototypeChip({super.key, this.label = 'prototype'});

  /// What the chip reads. Offline (the Product Review Prototype) → 'prototype';
  /// the Developer Preview (a live backend) → 'preview'. Either way it stays an
  /// honest, unmistakable "not the shipped product" marker.
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s2, vertical: 2),
      decoration: BoxDecoration(
        border: Border.all(color: NiaTokens.hairline),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: NiaTokens.inkSecondary,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}

/// Renders an unresolved Founder Decision (FD-#) or Product debate (Q#) as an
/// explicit, marked placeholder. The prototype never invents the undecided
/// behaviour; it shows the gap.
class FdPlaceholder extends StatelessWidget {
  const FdPlaceholder({super.key, required this.code, required this.label});

  /// e.g. 'FD-3', 'Q2'.
  final String code;

  /// What is undecided, in plain words.
  final String label;

  @override
  Widget build(BuildContext context) {
    // Calmer in Iteration 2: a quiet amber left-rule instead of a filled box.
    // Still an unmistakable, preserved placeholder marker — never invented behaviour.
    return Container(
      padding: const EdgeInsets.only(left: NiaTokens.s3),
      decoration: const BoxDecoration(
        border: Border(
          left: BorderSide(color: NiaTokens.amber, width: 2),
        ),
      ),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(
              fontSize: 13, color: NiaTokens.inkSecondary, height: 1.4),
          children: <InlineSpan>[
            TextSpan(
              text: '$code  ',
              style: const TextStyle(
                  fontWeight: FontWeight.w600, color: NiaTokens.amber),
            ),
            TextSpan(text: label),
            const TextSpan(text: '  · pending Founder decision'),
          ],
        ),
      ),
    );
  }
}

/// Illustrative placeholder data. NOT real, NOT from a backend, NOT a contract.
/// Numerals are shown in Latin digits here; in production they render in the
/// Member's script by default (Book III §5.3).
abstract final class PrototypeData {
  static const String memberName = 'Ramesh';
  static const String memberFullName = 'Ramesh Kumar';
  // Illustrative only — the Member's phone is not yet on the Membership contract
  // (GET /membership/me carries id, name, state). Masked as it would be shown.
  static const String phoneMasked = '+91 98••• ••210';
  static const String homePlace = 'Ganjam, Odisha';
  static const String language = 'Odia';
  static const String emergencyContact = 'Sunita (wife) · contact on file';

  // "My Family" is a Member-only VIEW (spec 0001 [A4], Q3 resolved) — the people
  // the Member's work is for. Illustrative; a real family record is a later slice.
  static const String familyMemberName = 'Sunita';
  static const String familyMemberRelation = 'Wife';
  static const String familyMemberPlace = 'Ganjam, Odisha';

  static const String operatorName = 'Suresh';
  static const String operatorStudio = 'Peenya Studio, Bengaluru';

  static const String membershipNumber = 'illustrative — not a real number';

  // Wallet figure for the Home glance — placeholder only. The Wallet screen
  // itself now renders from the Wallet Overview read model (spec §14 step 4),
  // so its per-line placeholders were removed.
  static const String walletAvailable = '₹3,480';
}
