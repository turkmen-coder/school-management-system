
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  domain: 'domain',
  settings: 'settings',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CampusScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  address: 'address',
  phone: 'phone',
  email: 'email',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  email: 'email',
  phone: 'phone',
  passwordHash: 'passwordHash',
  role: 'role',
  refreshToken: 'refreshToken',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  campusId: 'campusId',
  schoolYear: 'schoolYear',
  tcNo: 'tcNo',
  studentNo: 'studentNo',
  firstName: 'firstName',
  lastName: 'lastName',
  birthDate: 'birthDate',
  gender: 'gender',
  classLevel: 'classLevel',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  tcNo: 'tcNo',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  email: 'email',
  address: 'address',
  relationType: 'relationType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentParentScalarFieldEnum = {
  studentId: 'studentId',
  parentId: 'parentId',
  isPrimary: 'isPrimary',
  createdAt: 'createdAt'
};

exports.Prisma.ProspectScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  email: 'email',
  status: 'status',
  source: 'source',
  score: 'score',
  stage: 'stage',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InteractionScalarFieldEnum = {
  id: 'id',
  prospectId: 'prospectId',
  type: 'type',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.ConversionScalarFieldEnum = {
  id: 'id',
  prospectId: 'prospectId',
  studentId: 'studentId',
  convertedAt: 'convertedAt'
};

exports.Prisma.ExamScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  campusId: 'campusId',
  name: 'name',
  date: 'date',
  duration: 'duration',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExamSessionScalarFieldEnum = {
  id: 'id',
  examId: 'examId',
  campusId: 'campusId',
  room: 'room',
  capacity: 'capacity',
  startTime: 'startTime',
  createdAt: 'createdAt'
};

exports.Prisma.ExamApplicationScalarFieldEnum = {
  id: 'id',
  examId: 'examId',
  prospectId: 'prospectId',
  studentId: 'studentId',
  status: 'status',
  score: 'score',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdmissionTicketScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  sessionId: 'sessionId',
  seatNumber: 'seatNumber'
};

exports.Prisma.ContractScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  campusId: 'campusId',
  schoolYear: 'schoolYear',
  studentId: 'studentId',
  contractNo: 'contractNo',
  totalAmount: 'totalAmount',
  discountAmount: 'discountAmount',
  netAmount: 'netAmount',
  installmentCount: 'installmentCount',
  status: 'status',
  signedAt: 'signedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeeItemScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  schoolYear: 'schoolYear',
  name: 'name',
  amount: 'amount',
  category: 'category',
  isMandatory: 'isMandatory',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContractItemScalarFieldEnum = {
  id: 'id',
  contractId: 'contractId',
  feeItemId: 'feeItemId',
  description: 'description',
  quantity: 'quantity',
  unitAmount: 'unitAmount',
  totalAmount: 'totalAmount',
  createdAt: 'createdAt'
};

exports.Prisma.ContractDiscountScalarFieldEnum = {
  id: 'id',
  contractId: 'contractId',
  type: 'type',
  amount: 'amount',
  percentage: 'percentage',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.InstallmentScalarFieldEnum = {
  id: 'id',
  contractId: 'contractId',
  sequenceNo: 'sequenceNo',
  amount: 'amount',
  dueDate: 'dueDate',
  status: 'status',
  paidAmount: 'paidAmount',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  contractId: 'contractId',
  installmentId: 'installmentId',
  amount: 'amount',
  method: 'method',
  providerName: 'providerName',
  providerTransactionId: 'providerTransactionId',
  status: 'status',
  providerResponse: 'providerResponse',
  processedAt: 'processedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RefundScalarFieldEnum = {
  id: 'id',
  paymentId: 'paymentId',
  amount: 'amount',
  reason: 'reason',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  recipient: 'recipient',
  type: 'type',
  subject: 'subject',
  content: 'content',
  status: 'status',
  sentAt: 'sentAt',
  error: 'error',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  Campus: 'Campus',
  User: 'User',
  Student: 'Student',
  Parent: 'Parent',
  StudentParent: 'StudentParent',
  Prospect: 'Prospect',
  Interaction: 'Interaction',
  Conversion: 'Conversion',
  Exam: 'Exam',
  ExamSession: 'ExamSession',
  ExamApplication: 'ExamApplication',
  AdmissionTicket: 'AdmissionTicket',
  Contract: 'Contract',
  FeeItem: 'FeeItem',
  ContractItem: 'ContractItem',
  ContractDiscount: 'ContractDiscount',
  Installment: 'Installment',
  Payment: 'Payment',
  Refund: 'Refund',
  Notification: 'Notification'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
