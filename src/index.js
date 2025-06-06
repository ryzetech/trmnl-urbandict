export default {
	async fetch(request, env, ctx) {
		const urbanMainPageResponse = await fetch('https://www.urbandictionary.com');

		if (!urbanMainPageResponse.ok)
			return new Response('Failed to fetch Urban Dictionary main page', { status: urbanMainPageResponse.status });

		const urbanMainPageText = await urbanMainPageResponse.text();

		// regex the first define link from that mess of a page
		const wordExtractor = /href="\/define.php\?term=([^"]+)"/;
		const wordPath = urbanMainPageText.match(wordExtractor);

		if (!wordPath || wordPath.length < 2) {
			return new Response('No word found on Urban Dictionary main page', { status: 404 });
		}

		// undocumented api goes brrr
		const urbanWordResponse = await fetch("https://api.urbandictionary.com/v0/define?term=" + encodeURIComponent(wordPath[1]));

		if (!urbanWordResponse.ok)
			return new Response('Failed to fetch Urban Dictionary word', { status: urbanWordResponse.status });

		const urbanWordData = await urbanWordResponse.json();

		if (!urbanWordData || urbanWordData.length === 0) {
			return new Response('No definition found for the word', { status: 404 });
		}

		// we only want the first definition and rewrite it a bit
		let urbanWordDataJson = urbanWordData.list[0];

		// clean up that bish
		urbanWordDataJson.definition = urbanWordDataJson.definition.replace(/\[|\]/g, '');
		urbanWordDataJson.example = urbanWordDataJson.example.replace(/\[|\]/g, '');

		return new Response(JSON.stringify(urbanWordDataJson), {
			status: 200,
			headers: {'Content-Type': 'application/json'},
		});
	},
};
