import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from '@react-email/components'
import { Html } from '@react-email/html'
import * as React from 'react'
import { type SessionMetadata } from '@/src/shared/types/session-metadata.type'


interface ResetPasswordnTemplateProps {
    domain: string,
    token: string,
    metadata: SessionMetadata
}

export function ResetPasswordTemplate({ domain, token, metadata }: ResetPasswordnTemplateProps) {
    const resetLink = `${domain}/account/recovery/${token}`;

    return (
		<Html>
			<Head />
			<Preview>Password reset</Preview>
			<Tailwind>
				<Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className='text-center mb-8'>
						<Heading className='text-3xl text-black font-bold'>
							Password reset
						</Heading>
						<Text className="text-black text-base mt-2">
							You&apos;ve asked for password reset for your account
						</Text>
						<Text className="text-black text-base mt-2">
							Plase follow this link in order to create new password
						</Text>
						<Link href={resetLink} className='inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#18B9AE] px-5 py-2'>
							Password Reset
						</Link>
					</Section>

					<Section className='bg-gray-100 rounded-lg p-6 mb-6'>
						<Heading 
							className='text-xl font-semibold text-[#18B9AE]'
						>
							Request Info:
						</Heading>
						<ul className="list-disc list-inside text-black mt-2">
							<li>🌍 Location: {metadata.location.country}, {metadata.location.city}</li>
							<li>📱 operational system: {metadata.device.os}</li>
							<li>🌐 Browser: {metadata.device.browser}</li>
							<li>💻 IP-address: {metadata.ip}</li>
						</ul>
						<Text className='text-gray-600 mt-2'>
                            If you haven&apos;t inialize this request, please ignore it
						</Text>
					</Section>

					<Section className='text-center mt-8'>
						<Text className='text-gray-600'>
							If you have any questions, please contact our support service{' '}
							<Link 
								href="mailto:help@teastream.ru" 
								className="text-[#18b9ae] underline"
							>
								help@yevhen.ua
							</Link>.
						</Text>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	)
}