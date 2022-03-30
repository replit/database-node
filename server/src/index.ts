import axios from 'axios';
import { config } from 'dotenv';
import express, { raw, Request, Response } from 'express';
import { generateUrl } from './generateUrl';

const join = (...args: string[]) => {
	const cleanedArray = args.map((arg) => {
		// Remove the first and last character if they are '/'
		if (arg.startsWith('/')) {
			arg = arg.substring(1);
		}
		if (arg.endsWith('/')) {
			arg = arg.substring(0, arg.length - 1);
		}
		return arg;
	});
	// Join the array with '/'
	return cleanedArray.join('/');
};

// Load environment variables from .env file
config();
// Get the db URL
const dbUrl = process.env.REPLIT_DB_URL || '';
// Get the password
const pw = process.env.DB_PASS || '';
// Create the express app
const app = express();
// Use raw bodyparser
app.use(raw({ type: '*/*' }));

// Get a key from the DB
app.get('/db/:token/:key', async (req: Request, res: Response) => {
	// Make sure the token is valid
	if (req.params.token !== Buffer.from(pw, 'utf8').toString('base64')) {
		return res.status(401).contentType('text').send('Invalid token');
	}
	// Make a request to the DB
	const request = await axios.get(
		join(dbUrl, encodeURIComponent(req.params.key || ''))
	).catch((err) => {
		console.log(err);
		// If the request returns 404, return 404
		if (err.response && err.response.status === 404) return 404;
		// Otherwise return 500
		return 500;
	});
	// Return a code if the request failed
	if (typeof request === 'number') {
		return res.sendStatus(request);
	}
	// Return the data
	return request.data ? res.contentType('text').send((request.data || 'null').toString())
		: res.sendStatus(404);
});

// Get list of keys from the DB
app.get('/db/:token', async (req: Request, res: Response) => {
	// Make sure the token is valid
	if (req.params.token !== Buffer.from(pw, 'utf8').toString('base64')) {
		return res.status(401).contentType('text').send('Invalid token');
	}
	// Make a request to the DB
	const request = await axios.get(generateUrl(dbUrl, {
		prefix: (req.query.prefix || '').toString(),
		encode: (req.query.encode || '').toString()
	}) || '').catch((err) => {
		// If the request returns 404, return 404
		if (err.response && err.response.status === 404) return 404;
		// Otherwise return 500
		return 500;
	});
	// Return a code if the request failed
	if (typeof request === 'number') {
		return res.sendStatus(request);
	}
	// Return the data
	return request.data ? res.contentType('text').send((request.data || 'null').toString())
		: res.sendStatus(204);
});

// Set with URL
app.post('/db/:token/:setters', async (req: Request, res: Response) => {
	// Make sure the token is valid
	if (req.params.token !== Buffer.from(pw, 'utf8').toString('base64')) {
		return res.status(401).contentType('text').send('Invalid token');
	}
	// Parse the setters
	const set = req.path.split('/')[2];
	// Make a request to the DB
	const request = await axios.post(
		dbUrl,
		set,
		{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
	).catch((err) => {
		// If the request returns 404, return 404
		if (err.response && err.response.status === 404) return 404;
		// Otherwise return 500
		return 500;
	});
	// Return a code if the request failed
	if (typeof request === 'number') {
		return res.sendStatus(request);
	}
	// Return no content
	return res.sendStatus(204);
});

// Set with body
app.post('/db/:token', async (req: Request, res: Response) => {
	// Make sure the token is valid
	if (req.params.token !== Buffer.from(pw, 'utf8').toString('base64')) {
		return res.status(401).contentType('text').send('Invalid token');
	}
	// Make a request to the DB
	const request = await axios.post(
		dbUrl,
		req.body,
		{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
	).catch((err) => {
		// If the request returns 404, return 404
		if (err.response && err.response.status === 404) return 404;
		// Otherwise return 500
		return 500;
	});
	// Return a code if the request failed
	if (typeof request === 'number') {
		return res.sendStatus(request);
	}
	// Return no content
	return res.sendStatus(204);
});

// Delete
app.delete('/db/:token/:key', async (req: Request, res: Response) => {
	// Make sure the token is valid
	if (req.params.token !== Buffer.from(pw, 'utf8').toString('base64')) {
		return res.status(401).contentType('text').send('Invalid token');
	}
	// Make a request to the DB
	const request = await axios.delete(join(dbUrl, encodeURIComponent(req.params.key || ''))).catch((err) => {
		// If the request returns 404, return 404
		if (err.response && err.response.status === 404) return 404;
		// Otherwise return 500
		return 500;
	});
	// Return a code if the request failed
	if (typeof request === 'number') {
		return res.sendStatus(request);
	}
	// Return nothing
	return res.sendStatus(204);
});

// Listen
app.listen(5000);