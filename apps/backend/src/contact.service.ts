import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from './database.service';
import { notifySafely } from './notify-safely.util';
import { AppStateService } from './app-state.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly database: DatabaseService,
    private readonly state: AppStateService,
  ) {}

  async submitContact(body: { name: string; email: string; message: string }) {
    if (!body.name || !body.email || !body.message || !/^\S+@\S+\.\S+$/.test(body.email)) {
      throw new BadRequestException('All fields are required');
    }
    const stored = await this.database.insertContactSubmission(body);
    const entry = stored ?? {
      id: randomUUID(),
      status: 'received',
      createdAt: new Date().toISOString(),
    };
    if (!stored) {
      this.state.contacts.unshift({
        id: entry.id,
        name: body.name,
        email: body.email,
        message: body.message,
        status: entry.status,
        createdAt: entry.createdAt,
      });
    }
    const emailResult = await notifySafely(this.state.notifications?.contactMessage(body));
    return {
      message: 'Thank you for contacting us',
      id: entry.id,
      emailNotification: emailResult?.sent ? 'sent' : emailResult?.reason || 'queued',
    };
  }

  async listContacts() {
    return (await this.database.listContactSubmissions()) ?? this.state.contacts;
  }
}
