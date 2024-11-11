({

  /**
   * @param {ControllerPayload} props
   * @returns {Promise<Response>}
   */
  async get({ params }) {
    const { account } = params;

    const html = await ctx.render(resolve("./+page.html"), { account });
    return new ctx.Response(
      html, { headers: {"content-type": "text/html"} }
    );
    // return new ctx.Response(
    //   ctx.render(
    //     "{{>layout }} <h1> Hey, it is account of {{ account }} </h1> <ul>{{#beatles}}<li>{{ name }}</li>{{/beatles}}</ul>",
    //     {
    //       account,
    //       "beatles": [
    //         { "firstName": "John", "lastName": "Lennon",  },
    //         { "firstName": "Paul", "lastName": "McCartney" },
    //         { "firstName": "George", "lastName": "Harrison" },
    //         { "firstName": "Ringo", "lastName": "Starr" }
    //       ],
    //       "name": function () {
    //         return this.firstName + " " + this.lastName;
    //       }
    //     },
    //
    //     {
    //       layout: "{{>page}}<strong>feeling</strong>",
    //       page: "anton<br>"
    //     }
    //   ),
    //   { headers: { "Content-Type": "text/html" } }
    // );
  }
})
