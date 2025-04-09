import { type SessionMetadata } from '@/src/shared/types/session-metadata.type'
import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from '@react-email/components'
import { Html } from '@react-email/html'
import * as React from 'react'

interface DeactivateTemplateProps {
	token: string
	metadata: SessionMetadata
}

export function DeactivateTemplate({ token, metadata }: DeactivateTemplateProps) {
	return (
		<Html>
			<Head />
			<Preview>Account Deactivation</Preview>
			<Tailwind>
				<Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className='text-center mb-8'>
						<Heading className='text-3xl text-black font-bold'>
							Deactivation Account Request
						</Heading>
						<Text className="text-black text-base mt-2">
                            You&apos; initialized the process of your account deactivation on the <b>YevhenStream</b>
						</Text>
					</Section>

					<Section className='bg-gray-100 rounded-lg p-6 text-center mb-6'>
						<Heading className='text-2xl text-black font-semibold'>
							Confirmation Code:
						</Heading>
						<Heading className='text-3xl text-black font-semibold'>
							{token}
						</Heading>
						<Text className='text-black'>
							This code is valid within 5 minutes
						</Text>
					</Section>

					<Section className='bg-gray-100 rounded-lg p-6 mb-6'>
						<Heading 
							className='text-xl font-semibold text-[#18B9AE]'
						>
							Request Info:
						</Heading>
						<ul className="list-disc list-inside text-black mt-2">
							<li>🌍 Location: {metadata.location.country}, {metadata.location.city}</li>
							<li>📱 Operational System: {metadata.device.os}</li>
							<li>🌐 Browser: {metadata.device.browser}</li>
							<li>💻 IP address: {metadata.ip}</li>
						</ul>
						<Text className='text-gray-600 mt-2'>
                            If hou haven&apos; initialized this request, please ignore this message
						</Text>
					</Section>

					<Section className='text-center mt-8'>
						<Text className='text-gray-600'>
                            If you have any questions or you have faced an issue, please contact our support
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
