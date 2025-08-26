import { Injectable } from '@nestjs/common';

// TODO: Fix PDF module import when available
interface AdmissionTicketData {
  application: { id: string };
  exam: {
    id: string;
    name: string;
    date: Date;
    duration: number;
  };
  session: {
    id: string;
    room: string;
    startTime: Date;
  };
  candidate: {
    firstName: string;
    lastName: string;
    tcNo?: string;
    phone: string;
  };
  seatNumber: number;
  instructions: string[];
}

interface ExamResult {
  applicationId: string;
  candidateName: string;
  tcNo: string;
  phone: string;
  score: number;
  passed: boolean;
}

class AdmissionGenerator {
  static generateAdmissionTicket(data: AdmissionTicketData): Buffer {
    // TODO: Implement PDF generation
    return Buffer.from(`Mock Admission Ticket for ${data.candidate.firstName} ${data.candidate.lastName}`);
  }

  static generateExamResults(examId: string, results: ExamResult[]): Buffer {
    // TODO: Implement PDF generation
    return Buffer.from(`Mock Exam Results for exam ${examId} with ${results.length} candidates`);
  }
}

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
        'Sınavdan 30 dakika önce sınav salonında bulununuz.',
        'Kalem, silgi ve kalemtıraş dışında herhangi bir materyal getirilmeyecektir.',
        'Cep telefonu ve elektronik cihazlar sınav salonuna alınamaz.',
        'Sınav süresince konuşmak yasaktır.',
      ],
    };

    return AdmissionGenerator.generateAdmissionTicket(admissionData);
  }

  async generateExamResults(exam: any): Promise<Buffer> {
    const results = exam.applications.map((app: any) => {
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