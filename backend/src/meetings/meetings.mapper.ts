import { Types } from 'mongoose';
import { MeetingDocument, Participant } from './schemas/meeting.schema';

interface PopulatedRoom {
  _id: Types.ObjectId;
  name: string;
  floor?: string;
}

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  position?: string;
}

function isPopulated<T>(value: Types.ObjectId | T): value is T {
  return typeof value === 'object' && value !== null && 'name' in value;
}

export function toPublicMeeting(meeting: MeetingDocument) {
  const room = meeting.room as unknown as Types.ObjectId | PopulatedRoom;
  const organizer = meeting.organizer as unknown as
    Types.ObjectId | PopulatedUser;

  return {
    id: meeting._id.toString(),
    title: meeting.title,
    description: meeting.description,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    status: meeting.status,
    isImportant: meeting.isImportant,
    onlineLink: meeting.onlineLink,
    room: isPopulated(room)
      ? { id: room._id.toString(), name: room.name, floor: room.floor }
      : { id: room.toString() },
    organizer: isPopulated(organizer)
      ? {
          id: organizer._id.toString(),
          name: organizer.name,
          position: organizer.position,
        }
      : { id: organizer.toString() },
    participants: meeting.participants.map((p: Participant) => {
      const participantUser = p.user as unknown as
        Types.ObjectId | PopulatedUser;
      return isPopulated(participantUser)
        ? {
            userId: participantUser._id.toString(),
            name: participantUser.name,
            position: participantUser.position,
            status: p.status,
            respondedAt: p.respondedAt,
          }
        : {
            userId: participantUser.toString(),
            status: p.status,
            respondedAt: p.respondedAt,
          };
    }),
  };
}
