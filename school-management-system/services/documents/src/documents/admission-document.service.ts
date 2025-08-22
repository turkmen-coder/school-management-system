import { Injectable } from '@nestjs/common';
import { AdmissionGenerator, AdmissionTicketData } from '@school-management/pdf';

@Injectable()
export class AdmissionDocumentService {
  async generateAdmissionTicket(application: any): Promise<Buffer> {
    const candidate = application.prospect || application.student;
    
    if (!candidate) {
      throw new Error('Candidate information not found');
    }

    const admissionData: AdmissionTicketData = {
      application: {
        id: application.id,
      },
      exam: {
        id: application.exam.id,
        name: application.exam.name,
        date: application.exam.date,
        duration: application.exam.duration,
      },
      session: {
        id: application.admissionTicket.session.id,
        room: application.admissionTicket.session.room,
        startTime: application.admissionTicket.session.startTime,
      },
      candidate: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        tcNo: candidate.tcNo || undefined,
        phone: candidate.phone,
      },
      seatNumber: application.admissionTicket.seatNumber,
      instructions: [
        'Sınava kimlik belgenizle birlikte geliniz.',
        'Sınavdan 30 dakika önce sınav salonunda bulununuz.',
        'Kalem, silgi ve kalemtıraş dışında herhangi bir materyal getirilmeyecektir.',
        'Cep telefonu ve elektronik cihazlar sınav salonuna alınamaz.',
        'Sınav süresince konuşmak yasaktır.',
      ],
    };

    return AdmissionGenerator.generateAdmissionTicket(admissionData);
  }

  async generateExamResults(exam: any): Promise<Buffer> {
    const results = exam.applications.map(app => {
      const candidate = app.prospect || app.student;
      return {
        applicationId: app.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        tcNo: candidate.tcNo || 'N/A',
        phone: candidate.phone,
        score: app.score,
        passed: app.score >= 70, // Geçme notu 70 olarak varsayıldı
      };
    });

    return AdmissionGenerator.generateExamResults(exam.id, results);
  }
}