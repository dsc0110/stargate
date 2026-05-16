import { MY_DOMAIN } from '$env/static/private';

export function load({ cookies }) {
	let isPrivateAccessAllowed = false;

	try {
		const token = cookies.get('CF_Authorization');
		if (token) {
			// JWT format: header.payload.signature
			const parts = token.split('.');
			if (parts.length === 3) {
				// Decode the payload (second part)
				const payload = JSON.parse(atob(parts[1]));
				const email = payload.email || '';

				// Check if email ends with the domain
				if (email && MY_DOMAIN && email.endsWith(MY_DOMAIN)) {
					isPrivateAccessAllowed = true;
				}
			}
		}
	} catch (error) {
		console.error('Error parsing JWT token:', error);
	}

	return {
		isPrivateAccessAllowed,
		myDomain: MY_DOMAIN
	};
}
