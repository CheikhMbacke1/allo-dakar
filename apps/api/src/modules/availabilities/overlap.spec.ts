import { rangesOverlap } from './availabilities.service';

describe('rangesOverlap', () => {
  it('détecte un chevauchement simple', () => {
    // 14h00-16h00 vs 15h00-17h00 -> chevauchement
    expect(rangesOverlap(14 * 60, 16 * 60, 15 * 60, 17 * 60)).toBe(true);
  });

  it("ne détecte pas de chevauchement quand les créneaux se suivent exactement", () => {
    // 14h00-16h00 vs 16h00-18h00 -> pas de chevauchement (contigu)
    expect(rangesOverlap(14 * 60, 16 * 60, 16 * 60, 18 * 60)).toBe(false);
  });

  it('ne détecte pas de chevauchement pour des créneaux disjoints', () => {
    expect(rangesOverlap(8 * 60, 10 * 60, 14 * 60, 16 * 60)).toBe(false);
  });

  it('détecte un chevauchement quand un créneau est entièrement inclus dans un autre', () => {
    expect(rangesOverlap(8 * 60, 20 * 60, 10 * 60, 12 * 60)).toBe(true);
  });
});
