export const AVAILABILITY_CREATED_EVENT = 'availability.created';

export class AvailabilityCreatedEvent {
  constructor(
    public readonly availabilityId: string,
    public readonly originCity: string,
    public readonly destinationCity: string,
    public readonly travelDate: Date,
    public readonly departureTime: Date,
    public readonly seatsAvailable: number,
  ) {}
}
