class GTranslate {
  // Singleton instance
  private static instance: GTranslate;

  private projectId = 'arqui-424602';
  private location = 'global';
  
  constructor() {
    if (GTranslate.instance) {
      return GTranslate.instance;
    } else {
      GTranslate.instance = this;
    }
  }

  public async translateText(text: string) {
    // Construct request
    const request = {
      "q": text,
      "target": "en",
      "format": "text"
    }

    // Run request
    const response = await fetch(
      "https://translation.googleapis.com/language/translate/v2",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
          'x-goog-user-project': this.projectId,
        },
        body: JSON.stringify(request),
      }
    );
    const json = await response.json();
    const data = json.data;

    for (const translation of data.translations ?? []) {
      console.log(`Translation: ${translation.translatedText}`);
    }

    return data.translations?.[0].translatedText || '';
  }
}

export const gtranslate = new GTranslate();