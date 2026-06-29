import 'package:flutter_test/flutter_test.dart';
import 'package:nia_i18n/nia_i18n.dart';

void main() {
  test('supports the seven Nia locales (Book III §5.2)', () {
    final codes =
        NiaLocalizations.supportedLocales.map((l) => l.languageCode).toSet();

    expect(
      codes,
      containsAll(<String>['en', 'hi', 'or', 'bn', 'ta', 'te', 'kn']),
    );
    expect(NiaLocalizations.supportedLocales.length, 7);
  });
}
