import { type FormEvent, useState } from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { HeroGeometric } from "~/components/ui/shape-landing-hero";
import { LiquidButton } from "~/components/ui/liquid-glass-button";
import { MagnetizeButton } from "~/components/ui/magnetize-button";
import { RainbowButton } from "~/components/ui/rainbow-button";
import { ButtonCta } from "~/components/ui/button-shiny";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )
        if (!feedback) return setStatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        console.log(data);
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <HeroGeometric
            badge="Resume Analysis"
            title1="Upload Your"
            title2="Resume"
        >
            <Navbar />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-20">
                <div className="text-center mb-12">
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-6">
                            <h2 className="text-2xl md:text-3xl font-light text-white/90">{statusText}</h2>
                            <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
                                <img src="/images/resume-scan.gif" className="w-full h-full object-cover opacity-80" alt="Scanning..." />
                            </div>
                        </div>
                    ) : (
                        <h2 className="text-xl md:text-2xl font-light text-white/60">
                            Drop your resume for an ATS score and improvement tips
                        </h2>
                    )}
                </div>

                {!isProcessing && (
                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="company-name" className="text-sm font-medium text-white/80 ml-1">Company Name</label>
                                <input
                                    type="text"
                                    name="company-name"
                                    placeholder="e.g. Google"
                                    id="company-name"
                                    className="w-full px-4 py-3 rounded-xl !bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="job-title" className="text-sm font-medium text-white/80 ml-1">Job Title</label>
                                <input
                                    type="text"
                                    name="job-title"
                                    placeholder="e.g. Senior Developer"
                                    id="job-title"
                                    className="w-full px-4 py-3 rounded-xl !bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="job-description" className="text-sm font-medium text-white/80 ml-1">Job Description</label>
                            <textarea
                                rows={5}
                                name="job-description"
                                placeholder="Paste the job description here..."
                                id="job-description"
                                className="w-full px-4 py-3 rounded-xl !bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-y min-h-[120px]"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full items-start">
                            <FileUploader onFileSelect={handleFileSelect}>
                                <div className="w-full flex justify-start">
                                    <ButtonCta label="Upload Resume" className="w-full min-w-[200px]" />
                                </div>
                            </FileUploader>
                        </div>

                        <div className="pt-4 flex justify-center w-full">
                            <RainbowButton type="submit" className="shadow-2xl">
                                Analyze Resume
                            </RainbowButton>
                        </div>
                    </form>
                )}
            </div>
        </HeroGeometric>
    )
}
export default Upload
