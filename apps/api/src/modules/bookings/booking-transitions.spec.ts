import { BOOKING_TRANSITIONS, BookingStatus } from '@allo-dakar/shared';

describe('BOOKING_TRANSITIONS', () => {
  it('interdit toute transition depuis un état terminal', () => {
    expect(BOOKING_TRANSITIONS[BookingStatus.TERMINEE]).toEqual([]);
    expect(BOOKING_TRANSITIONS[BookingStatus.ANNULEE]).toEqual([]);
  });

  it('permet la progression normale demandee -> ... -> terminee', () => {
    expect(BOOKING_TRANSITIONS[BookingStatus.DEMANDEE]).toContain(BookingStatus.EN_ATTENTE);
    expect(BOOKING_TRANSITIONS[BookingStatus.EN_ATTENTE]).toContain(BookingStatus.CONFIRMEE);
    expect(BOOKING_TRANSITIONS[BookingStatus.CONFIRMEE]).toContain(BookingStatus.CHAUFFEUR_EN_ROUTE);
    expect(BOOKING_TRANSITIONS[BookingStatus.EN_COURS]).toContain(BookingStatus.TERMINEE);
  });

  it("n'autorise pas de sauter des étapes (ex: demandee -> en_cours)", () => {
    expect(BOOKING_TRANSITIONS[BookingStatus.DEMANDEE]).not.toContain(BookingStatus.EN_COURS);
  });

  it('autorise l\'annulation à tout moment avant "en_cours"', () => {
    expect(BOOKING_TRANSITIONS[BookingStatus.DEMANDEE]).toContain(BookingStatus.ANNULEE);
    expect(BOOKING_TRANSITIONS[BookingStatus.CHAUFFEUR_ARRIVE]).toContain(BookingStatus.ANNULEE);
    expect(BOOKING_TRANSITIONS[BookingStatus.EN_COURS]).not.toContain(BookingStatus.ANNULEE);
  });
});
