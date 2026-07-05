/// Where the NiaBook home's TRUTH comes from. Same Sample/Api split as the other
/// sources: offline the app serves [HomeFacts.sample]; with a backend configured
/// it assembles the live facts from the Wallet Overview (the monthly read model)
/// plus the savings balance, the Floor and the Member's name. Facts the backend
/// does not yet serve (site, kept history, per-pillar attribution) fall back to
/// the sample and are labelled sample on [HomeFacts] — never invented as live.
library;

import '../membership/membership_source.dart';
import '../wallet/wallet_overview_source.dart';
import '../floor/floor_source.dart';
import '../savings/savings_source.dart';
import 'home_facts.dart';

abstract class HomeFactsSource {
  Future<HomeFacts> facts();
}

/// Offline default: the Founder-accepted sample truth.
class SampleHomeFactsSource implements HomeFactsSource {
  const SampleHomeFactsSource();

  @override
  Future<HomeFacts> facts() async => HomeFacts.sample;
}

/// Live: assemble the truth from the backend read models. Each sub-fetch degrades
/// independently to the sample value, so one missing surface never blanks the home.
class ApiHomeFactsSource implements HomeFactsSource {
  ApiHomeFactsSource({
    required this.wallet,
    required this.savings,
    required this.floor,
    required this.membership,
  });

  final WalletOverviewSource wallet;
  final SavingsSource savings;
  final FloorSource floor;
  final MembershipSource membership;

  @override
  Future<HomeFacts> facts() async {
    const HomeFacts fallback = HomeFacts.sample;

    final overview = await wallet.currentOverview(); // the core monthly truth

    final int savingsBalance = await _try(() async => (await savings.account()).balance.minor, fallback.savingsBalancePaise);
    final int floorProtected = await _try(() async => (await floor.current()).dignityFloor.minor, fallback.floorProtectedPaise);
    final String name = await _try(() async => (await membership.currentMembership()).name, fallback.memberName);

    return HomeFacts.fromOverview(
      overview,
      memberName: name,
      memberSite: fallback.memberSite, // backend does not serve the site yet
      savingsBalancePaise: savingsBalance,
      floorProtectedPaise: floorProtected,
      keptHistory: fallback.keptHistory, // momentum: sample until a multi-month read-model lands
      contributions: fallback.contributions, // attribution: sample until a contribution read-model lands
      identity: fallback.identity, // profile facts: sample until the profile read-model lands
    );
  }

  static Future<T> _try<T>(Future<T> Function() fetch, T fallback) async {
    try {
      return await fetch();
    } catch (_) {
      return fallback;
    }
  }
}
