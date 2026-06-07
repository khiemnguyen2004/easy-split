/**
 * Terms of Service & Privacy Policy content, shown in-app on the Legal screen.
 *
 * This is a practical, plain-language template modelled on what bill-splitting
 * apps (e.g. Splitwise, Tricount, Settle Up) typically disclose. It is NOT legal
 * advice — have it reviewed by a lawyer before a public release, and fill in the
 * bracketed placeholders ([Company], [jurisdiction], effective date).
 */
import type { Language } from '../i18n';

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  updated: string;
  sections: LegalSection[];
}

interface LegalContent {
  terms: LegalDoc;
  privacy: LegalDoc;
}

const vi: LegalContent = {
  terms: {
    title: 'Điều khoản sử dụng',
    updated: 'Cập nhật lần cuối: [ngày]',
    sections: [
      {
        heading: '1. Chấp nhận điều khoản',
        body: 'Khi tạo tài khoản hoặc sử dụng EasySplit, bạn đồng ý với các Điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng ứng dụng.',
      },
      {
        heading: '2. Điều kiện sử dụng',
        body: 'Bạn cần đủ 16 tuổi và cung cấp thông tin chính xác khi đăng ký. Bạn chịu trách nhiệm bảo mật tài khoản và mọi hoạt động phát sinh dưới tài khoản của mình.',
      },
      {
        heading: '3. Bản chất dịch vụ',
        body: 'EasySplit là công cụ ghi nhận và chia sẻ chi phí nhóm. EasySplit KHÔNG phải là dịch vụ thanh toán, ví điện tử hay trung gian chuyển tiền — mọi giao dịch tiền thật diễn ra trực tiếp giữa các thành viên. Số liệu công nợ chỉ mang tính tham khảo dựa trên dữ liệu bạn nhập.',
      },
      {
        heading: '4. Trách nhiệm người dùng',
        body: 'Bạn cam kết nhập dữ liệu trung thực, không dùng ứng dụng cho mục đích phi pháp, lừa đảo hay xâm phạm quyền của người khác. Mọi tranh chấp tiền bạc giữa các thành viên do các bên tự giải quyết.',
      },
      {
        heading: '5. Giới hạn trách nhiệm',
        body: 'Ứng dụng được cung cấp "nguyên trạng". EasySplit không chịu trách nhiệm cho thiệt hại phát sinh từ việc tính toán sai do dữ liệu nhập vào, tranh chấp giữa thành viên, hay gián đoạn dịch vụ ngoài tầm kiểm soát.',
      },
      {
        heading: '6. Chấm dứt',
        body: 'Bạn có thể xóa tài khoản bất cứ lúc nào. Chúng tôi có thể tạm ngưng tài khoản vi phạm Điều khoản.',
      },
      {
        heading: '7. Thay đổi điều khoản',
        body: 'Điều khoản có thể được cập nhật. Việc tiếp tục sử dụng sau khi cập nhật đồng nghĩa bạn chấp nhận thay đổi.',
      },
      {
        heading: '8. Liên hệ',
        body: 'Mọi thắc mắc xin gửi về support@easysplit.app.',
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật',
    updated: 'Cập nhật lần cuối: [ngày]',
    sections: [
      {
        heading: '1. Dữ liệu chúng tôi thu thập',
        body: 'Thông tin tài khoản (email, họ tên, số điện thoại nếu bạn cung cấp), dữ liệu chi tiêu bạn nhập, ảnh hóa đơn/minh chứng bạn tải lên, và dữ liệu kỹ thuật cơ bản để vận hành ứng dụng.',
      },
      {
        heading: '2. Mục đích sử dụng',
        body: 'Dữ liệu chỉ dùng để vận hành tính năng chia tiền, hiển thị công nợ và liên lạc hỗ trợ. Chúng tôi KHÔNG bán dữ liệu cá nhân của bạn cho bên thứ ba.',
      },
      {
        heading: '3. Chia sẻ trong nhóm',
        body: 'Khi bạn tham gia một nhóm, các thành viên khác trong nhóm đó có thể xem chi tiêu chung, tên hiển thị và các khoản đóng góp liên quan đến nhóm.',
      },
      {
        heading: '4. Lưu trữ & bảo mật',
        body: 'Dữ liệu được lưu trên hạ tầng Supabase với Row Level Security, chỉ thành viên hợp lệ mới truy cập được dữ liệu nhóm của họ. Mật khẩu được mã hóa và không hiển thị cho bất kỳ ai.',
      },
      {
        heading: '5. Quyền của bạn',
        body: 'Bạn có thể xem, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân và tài khoản của mình bất cứ lúc nào trong phần Cài đặt hoặc bằng cách liên hệ chúng tôi.',
      },
      {
        heading: '6. Liên hệ',
        body: 'Về quyền riêng tư, vui lòng liên hệ support@easysplit.app.',
      },
    ],
  },
};

const en: LegalContent = {
  terms: {
    title: 'Terms of Service',
    updated: 'Last updated: [date]',
    sections: [
      {
        heading: '1. Acceptance of terms',
        body: 'By creating an account or using EasySplit, you agree to these Terms. If you do not agree, please stop using the app.',
      },
      {
        heading: '2. Eligibility',
        body: 'You must be at least 16 years old and provide accurate information when registering. You are responsible for keeping your account secure and for all activity under it.',
      },
      {
        heading: '3. Nature of the service',
        body: 'EasySplit is a tool for recording and sharing group expenses. EasySplit is NOT a payment service, e-wallet or money transmitter — all real money transfers happen directly between members. Debt figures are indicative only, based on the data you enter.',
      },
      {
        heading: '4. Your responsibilities',
        body: 'You agree to enter truthful data and not to use the app for unlawful, fraudulent or rights-infringing purposes. Any monetary disputes between members are resolved between those members.',
      },
      {
        heading: '5. Limitation of liability',
        body: 'The app is provided "as is". EasySplit is not liable for losses arising from miscalculations due to entered data, disputes between members, or service interruptions beyond our control.',
      },
      {
        heading: '6. Termination',
        body: 'You may delete your account at any time. We may suspend accounts that violate these Terms.',
      },
      {
        heading: '7. Changes to the terms',
        body: 'These Terms may be updated. Continued use after an update means you accept the changes.',
      },
      {
        heading: '8. Contact',
        body: 'For questions, contact support@easysplit.app.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: [date]',
    sections: [
      {
        heading: '1. Data we collect',
        body: 'Account information (email, full name, phone number if provided), the expense data you enter, receipt/proof images you upload, and basic technical data needed to run the app.',
      },
      {
        heading: '2. How we use it',
        body: 'Data is used only to operate the expense-splitting features, show balances and provide support. We do NOT sell your personal data to third parties.',
      },
      {
        heading: '3. Sharing within groups',
        body: 'When you join a group, other members of that group can see shared expenses, your display name and contributions related to the group.',
      },
      {
        heading: '4. Storage & security',
        body: 'Data is stored on Supabase infrastructure with Row Level Security, so only valid members can access their group data. Passwords are encrypted and never shown to anyone.',
      },
      {
        heading: '5. Your rights',
        body: 'You can view, edit or request deletion of your personal information and account at any time in Settings or by contacting us.',
      },
      {
        heading: '6. Contact',
        body: 'For privacy matters, contact support@easysplit.app.',
      },
    ],
  },
};

const CONTENT: Record<Language, LegalContent> = { vi, en };

export const getLegalContent = (lang: Language): LegalContent => CONTENT[lang] ?? CONTENT.en;
