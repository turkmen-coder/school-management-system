import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { StudentForm } from './student-form';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

describe('StudentForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const renderStudentForm = (props = {}) => {
    const defaultProps = {
      onSubmit: mockOnSubmit,
      isLoading: false,
    };

    return render(<StudentForm {...defaultProps} {...props} />);
  };

  describe('Form Rendering', () => {
    it('should render form with all required fields', () => {
      renderStudentForm();

      expect(screen.getByLabelText(/Ad \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Soyad \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/TC Kimlik No \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Doğum Tarihi \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Cinsiyet \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Sınıf Seviyesi \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Telefon/)).toBeInTheDocument();
      expect(screen.getByLabelText(/E-posta/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Adres/)).toBeInTheDocument();
    });

    it('should render form title for new student', () => {
      renderStudentForm();
      expect(screen.getByText('Yeni Öğrenci Ekle')).toBeInTheDocument();
    });

    it('should render form title for editing student', () => {
      const initialData = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
      };
      
      renderStudentForm({ initialData });
      expect(screen.getByText('Öğrenci Düzenle')).toBeInTheDocument();
    });

    it('should populate form with initial data', () => {
      const initialData = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        tcNo: '12345678901',
        birthDate: '2010-05-15',
        gender: 'MALE' as const,
        classLevel: 5,
        phone: '05551234567',
        email: 'ahmet@example.com',
        address: 'Test Address',
      };

      renderStudentForm({ initialData });

      expect(screen.getByDisplayValue('Ahmet')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Yılmaz')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12345678901')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2010-05-15')).toBeInTheDocument();
      expect(screen.getByDisplayValue('05551234567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ahmet@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      renderStudentForm();
      
      const submitButton = screen.getByText('Kaydet');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Ad en az 2 karakter olmalıdır')).toBeInTheDocument();
        expect(screen.getByText('Soyad en az 2 karakter olmalıdır')).toBeInTheDocument();
        expect(screen.getByText('TC Kimlik No 11 haneli olmalıdır')).toBeInTheDocument();
        expect(screen.getByText('Doğum tarihi gereklidir')).toBeInTheDocument();
        expect(screen.getByText('Sınıf seviyesi 1-12 arasında olmalıdır')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate TC number length', async () => {
      renderStudentForm();
      
      const tcInput = screen.getByLabelText(/TC Kimlik No \*/);
      await userEvent.type(tcInput, '123456789'); // Too short

      const submitButton = screen.getByText('Kaydet');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('TC Kimlik No 11 haneli olmalıdır')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderStudentForm();
      
      // Fill required fields
      await userEvent.type(screen.getByLabelText(/Ad \*/), 'Ahmet');
      await userEvent.type(screen.getByLabelText(/Soyad \*/), 'Yılmaz');
      await userEvent.type(screen.getByLabelText(/TC Kimlik No \*/), '12345678901');
      await userEvent.type(screen.getByLabelText(/Doğum Tarihi \*/), '2010-05-15');
      
      // Invalid email
      await userEvent.type(screen.getByLabelText(/E-posta/), 'invalid-email');

      const submitButton = screen.getByText('Kaydet');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Geçerli email adresi giriniz')).toBeInTheDocument();
      });
    });

    it('should validate class level range', async () => {
      renderStudentForm();
      
      // Fill required fields first
      await userEvent.type(screen.getByLabelText(/Ad \*/), 'Ahmet');
      await userEvent.type(screen.getByLabelText(/Soyad \*/), 'Yılmaz');
      await userEvent.type(screen.getByLabelText(/TC Kimlik No \*/), '12345678901');
      await userEvent.type(screen.getByLabelText(/Doğum Tarihi \*/), '2010-05-15');
      
      // Set invalid class level
      const classSelect = screen.getByLabelText(/Sınıf Seviyesi \*/);
      fireEvent.change(classSelect, { target: { value: '15' } }); // Invalid value

      const submitButton = screen.getByText('Kaydet');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Sınıf seviyesi 1-12 arasında olmalıdır')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      renderStudentForm();

      // Fill all required fields
      await userEvent.type(screen.getByLabelText(/Ad \*/), 'Ahmet');
      await userEvent.type(screen.getByLabelText(/Soyad \*/), 'Yılmaz');
      await userEvent.type(screen.getByLabelText(/TC Kimlik No \*/), '12345678901');
      await userEvent.type(screen.getByLabelText(/Doğum Tarihi \*/), '2010-05-15');
      
      const genderSelect = screen.getByLabelText(/Cinsiyet \*/);
      fireEvent.change(genderSelect, { target: { value: 'MALE' } });
      
      const classSelect = screen.getByLabelText(/Sınıf Seviyesi \*/);
      fireEvent.change(classSelect, { target: { value: '5' } });

      // Fill optional fields
      await userEvent.type(screen.getByLabelText(/Telefon/), '05551234567');
      await userEvent.type(screen.getByLabelText(/E-posta/), 'ahmet@example.com');
      await userEvent.type(screen.getByLabelText(/Adres/), 'Test Address');

      const submitButton = screen.getByText('Kaydet');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          tcNo: '12345678901',
          birthDate: '2010-05-15',
          gender: 'MALE',
          classLevel: 5,
          phone: '05551234567',
          email: 'ahmet@example.com',
          address: 'Test Address',
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/students');
    });

    it('should show loading state during submission', async () => {
      renderStudentForm({ isLoading: true });

      const submitButton = screen.getByText('Kaydediliyor...');
      expect(submitButton).toBeDisabled();
    });

    it('should handle submission errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
      
      renderStudentForm();

      // Fill required fields
      await userEvent.type(screen.getByLabelText(/Ad \*/), 'Ahmet');
      await userEvent.type(screen.getByLabelText(/Soyad \*/), 'Yılmaz');
      await userEvent.type(screen.getByLabelText(/TC Kimlik No \*/), '12345678901');
      await userEvent.type(screen.getByLabelText(/Doğum Tarihi \*/), '2010-05-15');

      const submitButton = screen.getByText('Kaydet');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
      });

      // Should not navigate on error
      expect(mockPush).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('User Interactions', () => {
    it('should handle input changes', async () => {
      renderStudentForm();

      const firstNameInput = screen.getByLabelText(/Ad \*/);
      await userEvent.type(firstNameInput, 'Test Name');

      expect(firstNameInput).toHaveValue('Test Name');
    });

    it('should handle select changes', async () => {
      renderStudentForm();

      const genderSelect = screen.getByLabelText(/Cinsiyet \*/);
      fireEvent.change(genderSelect, { target: { value: 'FEMALE' } });

      expect(genderSelect).toHaveValue('FEMALE');
    });

    it('should handle textarea changes', async () => {
      renderStudentForm();

      const addressTextarea = screen.getByLabelText(/Adres/);
      await userEvent.type(addressTextarea, 'Long address text');

      expect(addressTextarea).toHaveValue('Long address text');
    });
  });

  describe('Navigation', () => {
    it('should navigate back on cancel button click', () => {
      renderStudentForm();

      const cancelButton = screen.getByText('İptal');
      fireEvent.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith('/students');
    });

    it('should navigate to students list after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      renderStudentForm();

      // Fill and submit form
      await userEvent.type(screen.getByLabelText(/Ad \*/), 'Ahmet');
      await userEvent.type(screen.getByLabelText(/Soyad \*/), 'Yılmaz');
      await userEvent.type(screen.getByLabelText(/TC Kimlik No \*/), '12345678901');
      await userEvent.type(screen.getByLabelText(/Doğum Tarihi \*/), '2010-05-15');

      const submitButton = screen.getByText('Kaydet');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/students');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderStudentForm();

      const inputs = screen.getAllByRole('textbox');
      const selects = screen.getAllByRole('combobox');
      
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });

      selects.forEach(select => {
        expect(select).toHaveAccessibleName();
      });
    });

    it('should associate error messages with inputs', async () => {
      renderStudentForm();

      const submitButton = screen.getByText('Kaydet');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/Ad \*/);
        const errorMessage = screen.getByText('Ad en az 2 karakter olmalıdır');
        
        expect(firstNameInput).toBeInvalid();
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      renderStudentForm();

      const firstInput = screen.getByLabelText(/Ad \*/);
      firstInput.focus();
      
      expect(firstInput).toHaveFocus();

      // Tab to next field
      await userEvent.tab();
      const secondInput = screen.getByLabelText(/Soyad \*/);
      expect(secondInput).toHaveFocus();
    });
  });
});