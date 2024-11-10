({

  /**
   * @param {ControllerPayload} props
   * @returns {Response}
   */
  get({ params }) {
    const { account } = params;

    return new ctx.Response(
      ctx.render(
        "{{>layout }} <h1> Hey, it is account of {{ account }} </h1> <ul>{{#beatles}}<li>{{ name }}</li>{{/beatles}}</ul>",
        {
          account,
          "beatles": [
            { "firstName": "John", "lastName": "Lennon",  },
            { "firstName": "Paul", "lastName": "McCartney" },
            { "firstName": "George", "lastName": "Harrison" },
            { "firstName": "Ringo", "lastName": "Starr" }
          ],
          "name": function () {
            return this.firstName + " " + this.lastName;
          }
        },

        {
          layout: "<strong>feeling</strong>"
        }
      ),
      { headers: { "Content-Type": "text/html" } }
    );
  }
})
