export interface ContractData {
  contractNo: string;
  tenant: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  campus: {
    name: string;
    address?: string;
    phone?: string;
  };
  student: {
    firstName: string;
    lastName: string;
    tcNo: string;
    birthDate: Date;
    classLevel: number;
  };
  parent: {
    firstName: string;
    lastName: string;
    tcNo: string;
    phone: string;
    email?: string;
    address?: string;
  };
  schoolYear: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  installments: Array<{
    sequenceNo: number;
    amount: number;
    dueDate: Date;
  }>;
  items: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    totalAmount: number;
  }>;
  discounts?: Array<{
    type: string;
    amount?: number;
    percentage?: number;
    reason?: string;
  }>;
}

export interface AdmissionTicketData {
  application: {
    id: string;
  };
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
  seatNumber: string;
  instructions?: string[];
}

export interface ReportData {
  title: string;
  subtitle?: string;
  tenant: {
    name: string;
    logo?: string;
  };
  generatedBy: string;
  filters?: Record<string, any>;
  data: any[];
  summary?: Record<string, any>;
}