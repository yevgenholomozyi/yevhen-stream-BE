import {
	Body,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Tailwind,
	Text
} from '@react-email/components';
import * as React from 'react';

interface AccountDeletionTemplateProps {
	domain: string
}

export function AccountDeletionTemplate({ domain }:AccountDeletionTemplateProps) {
	const registerLink = `${domain}/account/create`

	return (
		<Html>
		    <Head />
	        <Preview>Account has been deleted</Preview>
	        <Tailwind>
		        <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className="text-center">
						<Heading className="text-3xl text-black font-bold">
							Your account has been complete deleted
						</Heading>
						<Text className="text-base text-black mt-2">
                            Your account and all your data have been completely deleted from the database of YevhenStream.
						</Text>
					</Section>

					<Section className="bg-white text-black text-center rounded-lg shadow-md p-6 mb-4">
						<Text>
                            You will not recieve notifications from us any longer
						</Text>
						<Text>
                            If you want to come back, you can register once again
						</Text>
						<Link
							href={registerLink}
							className="inline-flex justify-center items-center rounded-md mt-2 text-sm font-medium text-white bg-[#18B9AE] px-5 py-2 rounded-full"
						>
							Register Once Again
						</Link>
					</Section>

					<Section className="text-center text-black">
						<Text>
                            Thank you for staying with us
						</Text>
					</Section>
		        </Body>
	        </Tailwind>
        </Html>
	)
}
