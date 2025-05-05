
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  const { user } = useAuth();
  
  // FAQ data
  const faqs = [
    {
      question: "How do I report a crime?",
      answer: "You can report a crime by visiting the 'Report a Crime' page on our website or by visiting your nearest police station. Provide as much detail as possible including dates, times, locations, and any evidence you may have."
    },
    {
      question: "How can I track the status of my case?",
      answer: "You can track your case status using the case reference number that was provided to you when you reported the crime. Enter this reference number on our 'Track a Case' page to see the current status."
    },
    {
      question: "What should I do in case of an emergency?",
      answer: "For emergencies requiring immediate police attention, please call 999 or 112. Do not use the online reporting system for incidents where immediate response is required."
    },
    {
      question: "How long will my case investigation take?",
      answer: "The duration of an investigation varies depending on the complexity of the case, available evidence, and resources. Simple cases may be resolved in days, while complex cases might take months. You can check your case status online or contact the investigating officer for updates."
    },
    {
      question: "What happens after I submit a report online?",
      answer: "After submitting a report, you will receive a confirmation email with a reference number. A police officer will review your case and may contact you for additional information. The case will be assigned to an investigating officer who will begin following up on your report."
    },
    {
      question: "Can I report anonymously?",
      answer: "Yes, you can submit anonymous reports for certain types of crimes. However, please note that anonymous reporting may limit our ability to investigate fully or contact you for additional information. For serious crimes, providing contact information is encouraged."
    },
    {
      question: "What information should I include in my crime report?",
      answer: "Include as much detail as possible: date, time, and location of incident; descriptions of any suspects (appearance, clothing, etc.); details of any vehicles involved; information about any witnesses; descriptions of stolen or damaged property; and any other relevant information that might help the investigation."
    },
    {
      question: "How do I provide additional information for an existing case?",
      answer: "If you have new information about a case you've already reported, use your case reference number to contact the investigating officer directly or visit your local police station."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-kenya-green/10 rounded-lg flex items-center justify-center mr-3">
              <HelpCircle className="text-kenya-green h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-kenya-black">Frequently Asked Questions</h1>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600">
              Find answers to common questions about crime reporting, case tracking, and the Kenya Police Case Management System.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600 pt-2">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="mt-8 bg-kenya-green/10 p-6 rounded-lg border border-kenya-green/20">
            <h2 className="text-lg font-semibold mb-2 text-kenya-black">Still have questions?</h2>
            <p className="text-gray-600 mb-4">
              If you couldn't find the answer you were looking for, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-medium mb-1">Phone Support</h3>
                <p className="text-gray-600">0800-000-000</p>
                <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
              </div>
              <div className="flex-1 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-medium mb-1">Email Support</h3>
                <p className="text-gray-600">support@police.go.ke</p>
                <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FAQPage;
