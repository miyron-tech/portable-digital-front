export const COMPANY_NAME = 'PORTABLE DIGITAL LIMITED';
export const COMPANY_NUMBER = '16974578';
export const LEGAL_VERSION = '9 October 2026';

export type LegalDocument = { slug: string; title: string; description: string; sections: { title: string; paragraphs: string[] }[] };

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'terms-of-service', title: 'Terms of Service',
    description: 'The terms for using our website and commissioning our digital services.',
    sections: [
      { title: 'Who we are and who these terms cover', paragraphs: [
        'Portable digital is operated by PORTABLE DIGITAL LIMITED, company number 16974578 (“we”, “us”, “our”). Our Company details page identifies the information still awaiting verification and our available contact channel.',
        'These terms cover our website and services supplied to individuals and businesses. A consumer is an individual acting wholly or mainly outside their trade, business, craft or profession. Mandatory consumer protections take priority over any conflicting provision. Business customers must have authority to act for the organisation placing the order. Our contracting services are intended for customers aged 18 or over.'
      ] },
      { title: 'Enquiries, estimates and the contract', paragraphs: [
        'Catalogue descriptions and estimates explain the proposed service; they are not acceptance of an order. Before a binding paid engagement, we will agree the scope, deliverables, price and currency, applicable taxes, payment schedule, delivery timetable, dependencies and any ongoing term in writing. You can correct details before submitting your request.',
        'A service contract is formed when we expressly accept your order in writing and provide the agreed terms in a form you can keep. An automated acknowledgement alone is not acceptance. We will correct pricing errors with you before acceptance; you may decline the corrected proposal. Additional work or charges require your agreement.',
        'The current website checkout is a demonstration: creating an order or completing the demo payment does not charge you, create a paid engagement or instruct us to begin work. A real payment arrangement requires a separate, clearly identified confirmation.'
      ] },
      { title: 'Prices, payment and ongoing services', paragraphs: [
        'The final proposal must state the total payable, including applicable taxes and unavoidable charges, or the calculation method where a total cannot reasonably be fixed in advance. Estimates are not permission to exceed an agreed budget. You are responsible for charges your bank discloses for currency conversion.',
        'Payment dates and milestones are agreed before acceptance. A retainer or recurring service must state its billing interval, minimum commitment, renewal arrangements and cancellation method. Selecting a number of periods in the demo does not authorise recurring charges. No automatic renewal or payment is authorised solely by these terms.'
      ] },
      { title: 'Performance and customer cooperation', paragraphs: [
        'We will perform services with reasonable care and skill, in accordance with the agreed description and timetable, or within a reasonable time where no time is agreed. Information about the service on which a consumer relies remains binding where the law requires.',
        'Please provide accurate instructions, lawful materials and the access reasonably required for the project. Use a secure agreed channel for credentials; do not put passwords or payment card details in enquiry forms. We will explain the effect of missing inputs and agree necessary changes. We remain responsible for our own work and cannot remove statutory rights by describing a date as an estimate.',
        'If an event outside our reasonable control affects delivery, we will notify you and take reasonable steps to minimise the effect. This does not remove rights to terminate or receive repayment for services not supplied.'
      ] },
      { title: 'Intellectual property and confidentiality', paragraphs: [
        'Each party retains ownership of materials it owned before the engagement. You permit us to use your materials only as needed to deliver the agreed work. You must have the rights necessary to supply those materials.',
        'The written proposal must specify ownership or licensing of deliverables, source code, third-party components and any payment conditions before acceptance. Unless agreed otherwise, after payment you receive a non-exclusive, perpetual licence to use paid deliverables for the purpose specified in the proposal; this does not transfer ownership of our pre-existing tools. Third-party and open-source components remain subject to their disclosed licences.',
        'We will treat non-public project information as confidential, share it only with people who need it for delivery and are subject to appropriate duties, and disclose it where legally required. We will not use your name, logo or confidential project work for publicity without permission.'
      ] },
      { title: 'Cancellation, problems and refunds', paragraphs: [
        'Our Refund & Cancellation policy explains cooling-off rights, early performance and remedies for defective services. It forms part of the proposed service terms. Starting a bespoke service does not automatically remove consumer cancellation rights.',
        'Tell us about a problem through the contact page or the correspondence channel for your engagement. Describe the issue and the outcome you seek. We will investigate and give a reasoned response. You do not have to complete our complaints process before exercising a statutory right.'
      ] },
      { title: 'Responsibility and suspension', paragraphs: [
        'Nothing excludes or limits liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any liability or statutory remedy that cannot lawfully be excluded or limited.',
        'For consumers, we are responsible for loss or damage that is a foreseeable result of our breach or failure to use reasonable care and skill. We do not apply a blanket fee-based liability cap to consumer claims. Business-specific risk allocation may be agreed separately in a written contract, subject to applicable law.',
        'We may restrict access where reasonably necessary to address unlawful use, a material breach or an immediate security threat. Where practicable, we will explain the reason and allow a reasonable opportunity to remedy the issue. Suspension does not automatically forfeit prepaid sums or remove rights relating to work already supplied.'
      ] },
      { title: 'Law, disputes and changes', paragraphs: [
        'The proposed governing law is the law of England and Wales. Consumers retain the mandatory protections and access to courts available under the law of their habitual residence. These terms do not require consumers to bring proceedings exclusively in England or waive collective or other mandatory remedies.',
        'Changes apply prospectively. The version supplied when a service contract is accepted continues to govern that engagement unless a lawful change is expressly agreed. If one provision is unenforceable, the remaining provisions continue so far as the law permits. Neither failure to enforce a right nor delay in doing so is a waiver.'
      ] },
    ],
  },
  {
    slug: 'refund-cancellation', title: 'Refund & Cancellation',
    description: 'Consumer cancellation rights, early starts, service problems and refunds.',
    sections: [
      { title: 'Scope and demo payments', paragraphs: [
        'This policy concerns services supplied by PORTABLE DIGITAL LIMITED, company number 16974578. Mandatory rights take priority. The website currently offers a demo payment flow and does not collect money through that flow; a demo transaction has no funds to refund.',
        'For a paid engagement, the accepted proposal identifies what you bought, the start date, the price and any ongoing commitment. Business customers do not normally have the statutory consumer cooling-off right, but retain their contractual and other legal remedies.'
      ] },
      { title: 'Consumer cooling-off period', paragraphs: [
        'For a service contract concluded online or otherwise at a distance, a consumer normally has 14 days after the day the contract is made to cancel without giving a reason. Send a clear statement before the period ends. A bespoke or customised service is not, merely for that reason, excluded from this right.',
        'If legally required cancellation information has not been supplied, the cancellation period may be extended by up to 12 months. If that information is supplied during the extension, the period generally ends 14 days after you receive it. Nothing in this policy shortens an extended statutory period.'
      ] },
      { title: 'Asking us to start within 14 days', paragraphs: [
        'We will not treat placing an order, accepting general terms or making payment as an express request for an early start. We must obtain a separate express request before starting during the cooling-off period and explain the consequences.',
        'If you then cancel before completion, you pay only a proportionate amount for work actually supplied up to cancellation, provided the required information and express request were obtained. The calculation uses the agreed total price, or market value where that price is excessive. We do not charge for work during this period where the law prohibits doing so.',
        'The service cancellation right is lost only after full performance where performance began with your express request and acknowledgement that full performance would end the right. Partial performance alone does not end it.'
      ] },
      { title: 'Digital content supplied separately', paragraphs: [
        'If an engagement includes separately supplied digital content not on a physical medium, different cancellation rules may apply. Supply during the cooling-off period requires your express prior consent, acknowledgement that starting supply ends the cancellation right, and the legally required confirmation in a durable medium. Without the required steps, we will not rely on that exception. Delivering a file as part of a service does not automatically waive your rights for the entire engagement.'
      ] },
      { title: 'How to cancel', paragraphs: [
        'Use the contact page or the contact channel stated in your accepted proposal. State that you are cancelling and identify the engagement. An order number helps but is not mandatory if we can otherwise identify the contract. Keep a copy of your message. We will acknowledge cancellation electronically when submitted online.',
        'You may use this optional model notice: “To PORTABLE DIGITAL LIMITED [insert the confirmed postal or email address supplied with your contract]: I/We hereby give notice that I/We cancel my/our contract for the supply of the following service: ____. Ordered on: ____. Name of consumer(s): ____. Address of consumer(s): ____. Signature of consumer(s), only if notified on paper: ____. Date: ____.” Delete as appropriate. You do not have to use this form or give a reason.'
      ] },
      { title: 'When and how we refund', paragraphs: [
        'For a valid statutory cancellation of a service, we reimburse sums due without undue delay and no later than 14 days after being informed of cancellation. Any permitted deduction for an expressly requested early start will be explained. We use the original payment method unless you expressly agree otherwise and will not charge a refund fee. Bank posting times do not extend our duty to make the reimbursement on time.'
      ] },
      { title: 'Faulty, misdescribed or delayed services', paragraphs: [
        'Consumer services must be provided with reasonable care and skill. Where the legal conditions are met, you may require repeat performance at our cost, within a reasonable time and without significant inconvenience. If repeat performance is impossible or is not provided as required, you may be entitled to a price reduction, potentially up to the full price. Other statutory remedies, including for binding information or timing failures, are preserved.',
        'An agreed statutory price-reduction refund will be made without undue delay and within 14 days after we agree that you are entitled to it, using the same payment method unless otherwise expressly agreed, without a fee. Digital content supplied separately has its own statutory quality and remedy protections. Expiry of a cooling-off period does not remove rights for defective performance.'
      ] },
      { title: 'Other cancellations and ongoing services', paragraphs: [
        'Outside a statutory cancellation right, contact us promptly so that avoidable work and costs can be stopped. Any cancellation charge must have a lawful contractual basis, reflect the circumstances and avoid disproportionate compensation or double recovery. We do not automatically treat every deposit or advance payment as non-refundable.',
        'For a retainer, the accepted proposal must explain how and when to end future periods. Cancellation of future renewals does not itself waive remedies for past service failures. If we cancel or cannot supply the agreed service, we will repay amounts for work not supplied, subject to any stronger rights you have.'
      ] },
    ],
  },
  {
    slug: 'privacy-policy', title: 'Privacy Policy',
    description: 'How personal information is used for enquiries, accounts, orders and service delivery.',
    sections: [
      { title: 'Controller and scope', paragraphs: [
        'PORTABLE DIGITAL LIMITED, company number 16974578, is the controller for personal information used to operate this website and manage its customer relationships. Use our contact page for privacy enquiries. Our verified postal address and direct privacy email must be added before this draft is finalised.',
        'This notice covers visitors, enquirers, account holders, customers and business contacts. Where we process personal data solely on a client’s instructions within a project, the client normally acts as controller and a separate data processing agreement must define our processor obligations.'
      ] },
      { title: 'Information we collect and its sources', paragraphs: [
        'You provide account information such as name, email and password; we store a password hash rather than a readable password. Enquiries may include phone number, project description, desired timeline and attachments. Orders contain selected services, prices, project notes, contact information and order history. Billing name and address may be required for a real payment.',
        'Our systems process authentication tokens, request metadata and IP addresses for operation and security. If real payment processing is enabled for an engagement, the payment provider may return transaction references, payment status and fraud or reconciliation information. A business contact’s information may also be provided by their employer or authorised project representative.',
        'Do not submit payment card details, credentials, special-category data or third-party personal information through project forms unless a necessary and appropriate secure arrangement has first been agreed.'
      ] },
      { title: 'Purposes and lawful bases', paragraphs: [
        'We use information to respond to requested proposals, create and administer accounts, deliver agreed work and manage orders where necessary to take steps at your request or perform a contract with you. When you act for a business rather than contract personally, our basis is our legitimate interest in communicating with that business and managing the engagement.',
        'We rely on legitimate interests in securing systems, preventing misuse, investigating incidents and establishing or defending legal claims, after considering the effect on individuals. We process required accounting or regulatory records to comply with applicable legal obligations. Where optional consent-based processing is introduced, it requires a separate choice that can be withdrawn; acceptance of terms is not marketing consent.',
        'Required form fields are needed to handle the relevant request or provide the account or service. Without them we may be unable to proceed. Optional fields are not a condition of unrelated services. We do not use this storefront to make solely automated decisions producing legal or similarly significant effects.'
      ] },
      { title: 'Recipients and payment processing', paragraphs: [
        'Access is limited to personnel and service providers who need information for the relevant task. Relevant categories include hosting and database providers, file storage and communications providers, delivery contractors, professional advisers and authorities where disclosure is legally required. Providers acting as processors must operate under appropriate contractual instructions.',
        'The present checkout demonstration does not collect card details or send a demo payment to a payment provider. The backend includes a WemoPay integration for real payment arrangements: if used, it sends customer identity and email, billing details, order amount, currency and reference data needed to process the payment. Payment details entered on a provider’s hosted page are handled under that provider’s own notice. The provider’s legal identity and privacy notice must be confirmed before live payment activation.',
        'We do not use the current storefront to sell personal information or operate advertising profiles. A corporate reorganisation may require limited disclosure under appropriate confidentiality and data-protection safeguards.'
      ] },
      { title: 'Storage, international access and security', paragraphs: [
        'The deployment locations, supplier list and countries from which suppliers or staff can access data are still being verified for the live service. This draft does not represent that all processing is confined to the UK.',
        'Before any restricted international transfer, we must establish a lawful transfer mechanism, such as applicable adequacy regulations or appropriate contractual safeguards, and complete required assessments. The final notice must identify relevant destinations and explain how to obtain information about safeguards. Contact us to request those details.',
        'We use access controls and authentication safeguards appropriate to the service. No internet transmission or storage system can be guaranteed completely secure. Any incident will be assessed and notified to affected people and regulators where required.'
      ] },
      { title: 'Retention', paragraphs: [
        'Retention is determined by the purpose and applicable legal requirements. Enquiries are retained while handling the request and any justified follow-up; account information while the account is needed; project and transaction records while needed for delivery, accounting duties and applicable claims periods. Security records are retained only for a proportionate investigation and protection period.',
        'We must confirm the operational retention schedule and backup deletion process before this notice is finalised. This text does not promise an automated deletion facility that has not been implemented. On a valid erasure request we assess what can be deleted and explain any record we must retain, its basis and relevant retention criteria.'
      ] },
      { title: 'Your rights and complaints', paragraphs: [
        'Subject to the relevant legal conditions, you may request access, correction, erasure, restriction or portability of your personal data, object to processing based on legitimate interests, and withdraw consent at any time without affecting earlier lawful processing. You have an unconditional right to object to direct marketing.',
        'Submit requests through our contact page, identifying the right you wish to exercise. We may ask for proportionate identity information where needed. We normally respond within one month; a permitted extension of up to two further months for complexity or number of requests will be explained within the first month. Requests are normally free, subject to statutory exceptions.',
        'You can complain to the UK Information Commissioner’s Office at ico.org.uk/make-a-complaint/ or to another competent data protection authority. You do not have to contact us first. Our services are not directed at children; contact us if you believe a child has submitted personal information.'
      ] },
      { title: 'Cookies and changes', paragraphs: [
        'Our Cookie Policy explains the authentication cookie used by the website. Material changes in processing require this notice to be updated and, where appropriate, brought to your attention before the new use begins. A notice update alone does not provide consent or a lawful basis for a new purpose.'
      ] },
    ],
  },
  {
    slug: 'cookie-policy', title: 'Cookie Policy',
    description: 'The browser storage used by the current storefront and how to control it.',
    sections: [
      { title: 'What cookies do', paragraphs: [
        'Cookies are small values stored by your browser and sent with relevant requests. Similar rules may cover local storage and other access to information on your device. PORTABLE DIGITAL LIMITED, company number 16974578, is responsible for the storefront’s use of these technologies.'
      ] },
      { title: 'Authentication cookie', paragraphs: [
        'store_session — first-party, strictly necessary authentication cookie. It is set after successful sign-in or registration and allows the website to identify your session for account and order features. Its scope is the website path “/”. It is HttpOnly, uses SameSite=Lax and is marked Secure in production.',
        'Its expiry matches the access-token lifetime configured by the server (the application default is 15 minutes). The browser’s cookie inspector shows the expiry of your actual session. Signing out deletes it from this browser. Changing the session configuration requires the published duration to be reviewed.',
        'This cookie supports the account functionality you request; it is not used for advertising. Consent is not required for storage that meets the strictly necessary exemption, but this information is provided so you can understand its purpose.'
      ] },
      { title: 'Optional technologies and third parties', paragraphs: [
        'The current storefront code does not install optional analytics or advertising cookies or use local storage for tracking. There is therefore no optional-cookie preference to accept in this version.',
        'Before introducing optional technologies that require consent, we will explain their providers, purposes and duration and offer a genuine choice before they run, including an equally accessible refusal and a way to withdraw consent. Continuing to browse is not consent.',
        'A separately visited payment provider may use technologies on its own hosted payment page. Review its cookie information when using that page. Hosting or security providers must also be checked before live deployment; additional technologies must be reflected here.'
      ] },
      { title: 'Your controls', paragraphs: [
        'You can inspect, delete or block cookies through your browser’s privacy settings. Blocking the authentication cookie prevents sign-in and account features from working correctly; public catalogue pages do not require you to sign in. Clearing cookies does not delete your account or server-side order records. Contact us through the contact page for questions, and see our Privacy Policy for personal-data rights.'
      ] },
    ],
  },
  {
    slug: 'acceptable-use', title: 'Acceptable Use',
    description: 'Rules for lawful, secure use of our website, accounts and services.',
    sections: [
      { title: 'Purpose and scope', paragraphs: [
        'This policy applies to the website and services of PORTABLE DIGITAL LIMITED, company number 16974578. Use them lawfully, respect the rights of others and comply with the scope of access granted to you. It supplements the Terms of Service and does not reduce mandatory consumer rights.'
      ] },
      { title: 'Prohibited conduct', paragraphs: [
        'Do not use our services for fraud, impersonation, phishing, unlawful discrimination, threats, harassment, child sexual exploitation, or other unlawful activity. Do not upload or distribute material that infringes intellectual property, confidentiality, privacy or data-protection rights.',
        'Do not introduce malware, steal credentials, access accounts or systems without permission, evade access controls, interfere with another customer’s data, or deliberately overload infrastructure. Do not send unsolicited bulk communications or use our infrastructure to conduct attacks.',
        'Do not run intrusive vulnerability scans or penetration tests without prior written authorisation defining the permitted scope. Do not evade restrictions by creating replacement accounts or misrepresent your identity or authority. Automated access must respect access restrictions and must not materially disrupt the service.'
      ] },
      { title: 'Accounts and project materials', paragraphs: [
        'Keep credentials secure and notify us promptly of suspected compromise. Provide accurate information and only upload materials you are entitled to share. Minimise personal information in briefs and attachments; use an agreed secure channel where sensitive information is necessary.',
        'We do not claim ownership of your materials because you submit them. Any access to them must be for delivery, security, investigation of a reported breach, or another lawful purpose described in our agreement or Privacy Policy.'
      ] },
      { title: 'Proportionate enforcement', paragraphs: [
        'We assess suspected misuse in context. Depending on seriousness, we may request clarification, require removal of offending material, restrict affected functionality or suspend or terminate access. Immediate action may be necessary for an urgent security risk, serious illegality or a legal obligation.',
        'Where lawful and practicable, we will give reasons, identify a route to challenge a mistake and allow a reasonable opportunity to remedy a remediable breach. Measures will be limited to what is reasonably necessary. We may preserve relevant evidence and report matters to competent authorities where required or lawfully justified.',
        'Enforcement does not automatically confiscate prepaid amounts, remove cancellation rights or exclude responsibility for our own breach. Refunds and termination consequences are governed by the contract and applicable law.'
      ] },
      { title: 'Reporting and review', paragraphs: [
        'Report suspected abuse or an incorrect restriction through the contact page or your engagement’s correspondence channel. Include the relevant URL or order reference and a factual description. Do not include stolen data, passwords or exploit material in a public message. We will review the information and explain the outcome where we can lawfully do so.'
      ] },
    ],
  },
  {
    slug: 'company-details', title: 'Company details',
    description: 'The legal entity behind Portable digital and company contact information.',
    sections: [
      { title: 'Legal identity', paragraphs: [
        'Legal name: PORTABLE DIGITAL LIMITED.',
        'Company number: 16974578. Trading name: Portable digital.',
        'Registered office and jurisdiction of registration: awaiting verification against the official Companies House record. No unverified address is presented here as the company’s registered office.'
      ] },
      { title: 'Contact', paragraphs: [
        'Website enquiries, cancellation requests, complaints and privacy requests can be submitted through the contact page. A direct monitored email address and confirmed postal address are still to be supplied for the final documents and paid-contract information.',
        'VAT registration status and any applicable VAT number are awaiting confirmation. A Companies House number is not a VAT number; no VAT registration is claimed here.'
      ] },
      { title: 'Service and payment information', paragraphs: [
        'Portable digital offers digital engineering, development, infrastructure and support services to businesses and individual consumers. Scope, delivery, price and any ongoing commitment must be agreed for each paid engagement.',
        'The current storefront checkout is a demonstration. It does not collect card details or charge the displayed amount. Any live paid engagement requires clear payment instructions and the required pre-contract information.'
      ] },
      { title: 'Verification status', paragraphs: [
        'These legal pages are drafts pending verification of company contact details, commercial procedures, suppliers, data locations and retention arrangements. They must not be treated as a completed compliance statement or as confirmation that a paid service has been accepted. Consult the official register using the link below for company filings.'
      ] },
    ],
  },
];
