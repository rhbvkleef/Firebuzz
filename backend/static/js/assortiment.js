/* eslint-env browser,jquery */
/**
* Created by Matthias on 31/12/2015.
*/

// This commented code is for switching list to gridview;
// but that won"t be available unless we have images to display along with the actual products.
// Blame the skrol-dudes!

// var grid = false;
$("#productlist").show();
$("#productgrid").hide();

/**
 * make a function to add a class to the given element.
 *
 * @param {string} classType the class to add to the elements
 * @returns {Function} the function that takes an element and adds the classtype to it
 */
function addCl(classType) {
    return function(el) {
        el.parentsUntil($("#webgroups").find(".root")).addClass(classType); // TODO: make this actually stop
    };
}

var addTree = addCl("tree");
var addOpen = addCl("open");

/**
 * A way to view the assortiment. It stores some information to make the responsiveness of the page a bit better.
 *
 * @param {string} name the name of this assortiment
 * @constructor
 */
function Assortiment(name) {
    this.lastData = {};
    this.name = name;
    this.root = $("#" + name);
    this.query = " ";
}

/**
 * Get all the products contained inside the webgroup with the given id
 *
 * @param {number} id the id of the webgroup
 * @param {Array.<Product>} [output=[]] the array to which to append the products.
 * @returns {Array.<Product>} all products inside this webgroup.
 */
Assortiment.prototype.getContainedProducts = function(id, output) {
    var v = this.lastData[id];
    if (typeof output === "undefined") output = [];

    for (var i in v.children) {
        output = this.getContainedProducts(v.children[i], output);
    }

    output = output.concat(v.products);
    return output;
};

/**
 * This updates the root of the Assortiment"s webgroups to the current SKROL-db contents.
 */
Assortiment.prototype.updateWebgroupRoot = function() {
    var self = this;
    var url = makeFullUrl("assortiment/search", encodeURI(this.query));
    // var error = "ERROR: geen verbinding met de SKROL-API";
    var curOpen = [];
    self.root.find(".open").each(function(a, b) {
        curOpen.push($(this).data("id"));
    });
    $.getJSON(url, function(data) {
        var rootnode = null;
        var v = self.root[0];
        while (v.firstChild != undefined) {
            v.removeChild(v.firstChild);
        }

        if (data.error != null) {
            rootnode = document.createElement("li");
            var text = document.createElement("p");
            text.classList.add("noitems");
            text.appendChild(document.createTextNode("Geen producten gevonden in de huidige selectie"));
            rootnode.appendChild(text);
        } else {
            self.parseJsonToMapping(data);
            rootnode = self.lastData[0].element;

            if (self.lastData[0].empty) {
                var e = document.createElement("li");
                e.classList.add("empty-visible");
                var p = document.createElement("p");
                p.classList.add("noitems");
                p.appendChild(document.createTextNode("Geen producten gevonden in de huidige selectie"));
                e.appendChild(p);
                self.root[0].appendChild(e);
            }
        }
        self.root[0].appendChild(rootnode);
        self.root.find(".expandable").each(function(a, b) {
            var parent = $(this).parent();
            if (curOpen.indexOf(parent.data("id")) > -1) {
                parent.addClass("open");
            }
        });
        self.root.find(".expandable").click(self.onWebGroupClicked());
        var b = self.root.find("li").find("[data-id='" + $.var.currentID + "']");
        addTree(b);
        addOpen(b);
        if (data.error == null) update();
    });
};

/**
 * Parse the JSON of a request, and update the current Assortiment
 *
 * @param {{pricelist: Array.<Object>, name: String, id: Number, error: ?String}} query the result of the SKROL-query
 */
Assortiment.prototype.parseJsonToMapping = function(query) {
    if (query.error != null) {

    } else {
        query.contents = query.pricelist ? query.pricelist : [];
        query.name = this.name;
        query.id = 0;
        this.lastData = [];
        this.lastData[0] = new Webgroup(query, this.lastData);
    }
};

/**
 * This function returns a function that gets executed every time a webgroup gets clicked
 */
Assortiment.prototype.onWebGroupClicked = function() {
    var self = this;
    return function() {
        $(".tree").removeClass("tree");
        $(".last").removeClass("last");
        addTree($(this));
        $(this).parent().addClass("last");
        $(this).parent().toggleClass("open");

        $.var.currentID = $(this).parent().data("id");
        $.var.hashParser.put("ID", $.var.currentID);
        $.var.currentSupplier = self;
        window.location.hash = "#" + $.var.currentID;
        update();
    };
};

/**
 * This is the Hashparser, which parses the hash part of the url and makes sense of it (if possible)
 * @constructor
 */
function HashParser() {
    this.hash = window.location.hash;
    this.values = {};

    var cleanhash = this.hash.split("#")[1] ? this.hash.split("#")[1] : "&page=0";
    var pairs = cleanhash.split("&");

    for (var i = 1; i < pairs.length; i += 1) {
        var pair = pairs[i].split("=");
        if (pair) {
            this.values[pair[0]] = pair[1];
        }
    }
}
/**
 * Update the hash to the currently stored values
 */
HashParser.prototype.update = function() {
    this.hash = "";
    for (var key in this.values) {
        this.hash += "&" + key + "=" + this.values[key];
    }
    window.location.hash = this.hash;
};

/**
 * Put a value in the hash
 *
 * @param {string} key key of the `key, value`-set
 * @param {*} value the value the key is set to
 */
HashParser.prototype.put = function(key, value) {
    this.values[key] = value;
    this.update();
};

/**
 * Remove the key from the values list.
 *
 * @param {string} key the key to be deleted
 */
HashParser.prototype.remove = function(key) {
    delete this.values[key];
    this.update();
};

/**
 * Get a value from the HashParser
 *
 * @param key the key to use to get the value
 * @returns {*} the value the key holds, otherwise 0
 */
HashParser.prototype.get = function(key) {
    if (this.values[key]) return this.values[key];
    else {
        return 0;
    }
};

/**
 * Make a new Paginator object
 *
 * @constructor
 */
function Paginator() {
    var self = this;
    this._products = {};
    this.ppp = $.var.hashParser.get("ppp") | 30;
    this.products = [];
    this.pages = [[]];
    this.currentpage = 0;

    $("#itemsPerPage").change(function(e) {
        var v = parseInt(e.currentTarget.value);
        $(e).blur();
        // eslint-disable-next-line
        if (v !== v) {
            self.setPPP("all");
        } else {
            self.setPPP(v);
        }
        self.parse(self._products);
    });
}

/**
 * Parse a set of products to a workable place
 *
 * @param _products the products to parse
 */
Paginator.prototype.parse = function (_products) {
    this._products = _products;                                     // save the link to the currently used list of products
    this.currentpage = $.var.hashParser.get("page");
    $.var.hashParser.put("page", this.currentpage);                 // ensure that "page" has a value in the hash
    this.products = _products.slice().sort($.var.sortingFunction);  // copy and then sort the list of products with the sorting function that is to be used

    if ($.var.sortDown) {                                           // reverse the list if necessary
        this.products.reverse();
    }
    this.pages = [];
    if (this.ppp != "all") {                                        // start paginating if not all products are to be listed
        var parsing = true;
        while (parsing) {
            var a = this.products.splice(0, this.ppp);              // split the array in pieces of ppp (products per page)
            if (a.length > 0) {
                this.pages.push(a);
            } else {
                parsing = false;
            }
        }
        if (this.pages.length == 0) {
            this.pages.push([]);                                    // at least put a page in the array, to not break any other code
        }
    } else {
        this.pages.push(this.products);                             // if "all" was selected, put all products in the first page
    }
    if (this.currentpage > this.pages.length - 1) {
        this.currentpage = this.pages.length - 1;
    }
    this.gotopage(this.currentpage);                                // go to the current page
};

/**
 * A function to call when you want to go to the next page
 */
Paginator.prototype.next = function() {
    var self = this;
    return function() {
        self.gotopage(
            self.currentpage == self.pages.length - 1 ? self.currentpage : ++self.currentpage // TODO: write this out
        );
    };
};

/**
 * A function to call when you want to go to the previous page
 */
Paginator.prototype.previous = function() {
    var self = this;
    return function() {
        self.gotopage(
            self.currentpage == 0 ? self.currentpage : --self.currentpage // TODO: write this out
        );
    };
};

/**
 * Set the amount of products you want per page
 *
 * @param {number|string} value the amount of products you want to see per page
 */
Paginator.prototype.setPPP = function(value) {
    this.ppp = value;
    $.var.hashParser.put("ppp", this.ppp);
};

/**
 * Go to a given page
 *
 * @param {number} index the page to go to in the assortiment
 */
Paginator.prototype.gotopage = function(index) {
    if (this.pages.length < index || index < 0) {
        index = this.pages.length - 1;
    }
    this.currentpage = index;
    this.render(this.pages[index], index, this.pages);
    $.var.hashParser.put("page", index);
};

/**
 * Go to a page in the assortment
 *
 * @param {number} index the index to go to
 * @returns {Function} the function that makes you go to the correct page
 */
Paginator.prototype.goto = function(index) {
    var self = this;
    var i = index;
    return function() {
        self.gotopage(i);
    };
};

/**
 * Render the paginated page
 *
 * @param {Product[]} products the products to render
 * @param {number} index the index of the page that is to be rendered
 * @param {Product[][]} pages the pages that can be rendered
 */
Paginator.prototype.render = function(products, index, pages) {
    parseJSONasList(products);
    parseJSONasGrid(products);
    var paginator = document.getElementsByClassName("pagination")[0];

    index = Number(index);
    var vi = 0;
    this.fixOrCreatePaginatorItem(
        paginator,
        vi,
        ((function() {
            var a = document.createElement("span");
            a.setAttribute("aria-hidden", "true");
            a.appendChild(document.createTextNode("«"));
            a.classList.add("page-item");
            return a;
        })()),
        "vorige",
        index == 0 ? "disabled" : "",
        index > 0 ? this.previous() : null
    );
    vi += 1;

    for (var i = 0; i < pages.length && i < 3; i += 1) {
        this.fixOrCreatePaginatorItem(
            paginator,
            vi,
            document.createTextNode(i + 1 + ""),
            "",
            i == index ? "active" : "",
            this.goto(i)
        );
        vi += 1;
    }

    if (Math.max(index - 3, 3) !== 3) {
        this.fixOrCreatePaginatorItem(
            paginator,
            vi,
            document.createTextNode("…"),
            "",
            "disabled",
            null
        );
        vi += 1;
    }

    for (i = Math.max(index - 2, 3); ((i < pages.length) && (i < (index + 3))); i += 1) {
        this.fixOrCreatePaginatorItem(
            paginator,
            vi,
            document.createTextNode(i + 1 + ""),
            "",
            i == index ? "active" : "",
            this.goto(i)
        );
        vi += 1;
    }

    if (pages.length - 3 > index + 3) {
        this.fixOrCreatePaginatorItem(
            paginator,
            vi,
            document.createTextNode("…"),
            "",
            "disabled",
            null
        );
        vi += 1;
    }

    for (i = Math.max(index + 3, pages.length - 3); i < pages.length; i += 1) {
        this.fixOrCreatePaginatorItem(
            paginator,
            vi,
            document.createTextNode(i + 1 + ""),
            "",
            i == index ? "active" : "",
            this.goto(i)
        );
        vi += 1;
    }

    this.fixOrCreatePaginatorItem(
        paginator,
        vi,
        ((function() {
            var a = document.createElement("span");
            a.setAttribute("aria-hidden", "true");
            a.appendChild(document.createTextNode("»"));
            a.classList.add("product-list");
            return a;
        })()),
        "volgende",
        index == pages.length - 1 ? "disabled" : "",
        this.next()
    );
    vi += 1;
    while (paginator.children.length > vi) {
        paginator.removeChild(paginator.lastChild);
    }
};

Paginator.prototype.fixOrCreatePaginatorItem = function (parent, childIndex, content, alpha, beta, onclick) {
    var li = null;
    var a = null;
    if (parent.children.length > childIndex) {
        li = parent.children[childIndex];
        a = li.children[0];
        while (a.hasChildNodes()) {
            a.removeChild(a.firstChild);
        }
        while (li.classList.length > 0) {
            li.classList.remove(li.classList[0]);
        }
    } else {
        li = document.createElement("li");
        a = document.createElement("a");
        li.appendChild(a);
        parent.appendChild(li);
    }
    a.classList.add("page-link");
    li.classList.add("page-item");
    a.appendChild(content);
    li.setAttribute("aria-label", alpha);
    if (beta != null && beta != "") {
        li.classList.add(beta);
    }
    li.onclick = onclick;
};

/**
 * Create a new Paginator block as seen under the products list.
 *
 * @param {string} content the content of the paginator item
 * @param {string} alpha the attribute value to be set in the `aria-label`-attribute
 * @param {string} beta the class to be added to the item
 * @returns {Element}
 */
Paginator.prototype.createPaginatorItem = function(content, alpha, beta) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.innerHTML = content;
    li.appendChild(a);
    if (alpha) {
        a.setAttribute("aria-label", alpha);
    }
    if (beta) {
        li.classList.add(beta);
    }
    return li;
};

// Save the request values locally, so that we can later use them to sort them.

/**
 *
 * @type {{sortingFunction: Function, sortingFunctions: {prijs: Function, naam: Function, voorraad: Function, ean: Function}, sortDown: boolean, stockOnly: boolean, currentID: number}}
 */
$.var = {
    sortingFunction: function(a, b) {
        return 0;
    },
    sortingFunctions: {
        prijs: function(a, b) {
            return a.price - b.price;
        },
        naam: function(a, b) {
            return a.name.localeCompare(b.name);
        },
        voorraad: function(a, b) {
            return a.stock - b.stock;
        },
        ean: function(a, b) {
            return a.ean.localeCompare(b.ean);
        }
    },
    sortDown: true,
    stockOnly: false,
    currentID: 0
};

/**
 * The object that holds all the search-data
 *
 * @type {Assortiment}
 */
$.var.search = new Assortiment("Zoekresultaten");

/**
 * The object that holds all of the currently available assortiment
 *
 * @type {Assortiment}
 */
$.var.assort = new Assortiment("Assortiment");

/**
 * The hashparser that is used
 *
 * @type {HashParser}
 */
$.var.hashParser = new HashParser();

/**
 * the paginator that is used
 *
 * @type {Paginator}
 */
$.var.paginator = new Paginator();

/**
 * The currently used supplier of products. This is just a technical term for which assortiment-object to use
 * to display items.
 *
 * @type {Assortiment}
 */
$.var.currentSupplier = $.var.assort;

/**
 * Set the active webgroup from the value in the url-hash
 *
 * @type {number}
 */
$.var.currentID = $.var.hashParser.get("ID") | 0;

updateAssortiment();

/**
 * Een parser om producten mee te maken
 *
 * @param {object} e het element waarvan een werkend product gemaakt moet worden
 * @constructor
 */
function Product(e) {
    this.price = e.price ? e.price : 0.0;
    this.ean = e.ean ? e.ean : "";
    this.name = e.name ? e.name : "";
    this.id = e.id ? e.id : "";
    this.stock = e.stock | 0;
    this.url = e.manufacturerurl ? e.manufacturerurl : "";
}

/**
 * Make a new Webgroup from the given JSON, and add it to the list that is given. Includes the recursive way
 * webgroups are specified in the SKROL protocol.
 *
 * @param {object} JSON
 * @param {Webgroup[]} list the list to which to add the webgroup made.
 * @constructor
 */
function Webgroup(JSON, list) {
    this.products = [];
    this.children = [];
    this.name = JSON.name ? JSON.name : " ";
    this.empty = true;
    this.id = JSON.id | 0;
    this.element = document.createElement("li");
    for (var i in JSON.contents) {
        var e = JSON.contents[i];
        if (e.contents != null) {
            var childWG = new Webgroup(e, list);
            this.children.push(childWG.id);
            this.empty = this.empty & childWG.empty;
        } else {
            var product = new Product(e);
            this.products.push(product);
            this.empty = this.empty & (product.stock == 0);
        }
    }

    this.children.sort(function(a, b) {
        if (list[a].name.length > 0 && list[b].name.length > 0) return list[a].name.localeCompare(list[b].name);
        return 0;
    });
    list[this.id] = this;

    makeWGhtml(this, list);
}

/**
 * Maakt een tree van de webgroep
 *
 * @param {Webgroup} webgroup de webgroep waarvan het HTML-element gemaakt moet worden.
 */
function makeWGhtml(wg, list) {
    var element = wg.element;
    element.dataset.id = wg.id;
    if (wg.empty) {
        element.classList.add("empty");
    }
    var nametag = document.createElement("a");
    nametag.appendChild(document.createTextNode(wg.name));
    nametag.classList.add("expandable");
    var childs = document.createElement("ul");
    childs.dataset.id = wg.id;
    childs.classList.add("contents");
    element.appendChild(nametag);

    for (var i = 0; i < wg.children.length; i++) {
        childs.appendChild(list[wg.children[i]].element);
    }

    element.appendChild(childs);
}

/**
 * dit is een functie die het assortiment opnieuw inlaadt/updatet.
 */
function updateAssortiment() {
    return $.var.assort.updateWebgroupRoot();
}

/**
 * zoek naar de term in het zoekveld
 */
function search() {
    $.var.currentSupplier = $.var.search;
    $.var.currentID = 0;
    $.var.search.query = $("#searchable").val();
    if ($.var.search.query.trim().length === 0) {  // if either no string, or string of only spaces
        $.var.search.query = " "; // set query to standard query used on loadpage
    }
    $.var.search.updateWebgroupRoot();
}

/**
 * updates the product-list
 */
function update() {
    var products = filter($.var.currentSupplier.getContainedProducts($.var.currentID));
    $.var.paginator.parse(products);
}

/**
 * A function to add filters to. Currently only filters on amount in stock, but this can be changed easily.
 *
 * @param {Product[]} input the list of products to be filtered
 * @returns {Product[]} the filtered output
 */
function filter(input) {
    var copy = input.slice();
    for (var i = 0; i < copy.length; i++) {
        if ($.var.stockOnly && copy[i].stock == 0) {
            delete copy[i];
        }
    }
    var ret = [];
    for (i in copy) {
        ret.push(copy[i]);
    }
    return ret;
}

/**
 * A function that makes an easy click-function
 *
 * @param {string} str the value to be toggled.
 */
function clickBuilder(str) {
    return function() {
        toggle(str);
    };
}

$("#prijs").click(clickBuilder("prijs"));
$("#naam").click(clickBuilder("naam"));
$("#voorraad").click(clickBuilder("voorraad"));
$("#ean").click(clickBuilder("ean"));

$("#search-button").click(search);
$("#searchable").keydown(function(e) {
    if (e.keyCode == 13) search();
});

$("#voorraadOnly").click(function(e) {
    $.var.stockOnly = !$.var.stockOnly;

    var v = $("#voorraadOnly");
    var w = $(".webgroups");

    if (!$.var.stockOnly) {
        v.addClass("disabled");
        w.removeClass("hide-empty");
    } else {
        v.removeClass("disabled");
        w.addClass("hide-empty");
    }

    $("#stockOnly").prop("checked", $.var.stockOnly);
    update();
});

/**
 * Toggle the sorting of the given type
 *
 * @param {string} ref the refered type of sorting
 */
function toggle(ref) {
    if ($.var.sortingFunction != $.var.sortingFunctions[ref]) {
        $.var.sortingFunction = $.var.sortingFunctions[ref];
    }
    var r = $("#" + ref);

    $.var.sortDown = r.hasClass("down");

    $(".up").removeClass("up").addClass("none");
    $(".down").removeClass("down").addClass("none");
    r.addClass(!$.var.sortDown ? "down" : "up");

    update();
}

/**
 * Parse given list of products to a grid-styled layout.
 *
 * @param JSON the json to parse to a grid
 */
function parseJSONasGrid(JSON) {
    var html = "";
    for (var i in JSON) {
        var content = JSON[i];
        if (content.price != null) {
            html += "<a id='gridproduct_" + content.id + "' href='" + makeFullUrl("assortiment/product", content.id) + "' class='thumbnail small'>";
            html += "<img src='' alt=''>";
            html += "<h6>" + content.name + "</h6>";
            html += "</a>";
        }
    }

    $("#productgrid").html(html);
}

/**
 * Make a table entry using classtype
 *
 * @param {string} classtype the classtype to add to the element
 * @returns {Element} the element that is created
 */
function createProductInfoElement(classtype) {
    var td = document.createElement("td");
    td.classList.add("product_info");
    td.classList.add(classtype);
    return td;
}

/**
 * Generate a table entry for a product
 *
 * @param {Product} product the product to make an entry of
 * @returns {Element} the TR-element that is generated using the data from the product.
 */
function createProductTrItem() {
    var tr = document.createElement("tr");
    // var url = createProductInfoElement("url");
    var name = createProductInfoElement("name");
    var price = createProductInfoElement("price");
    var stock = createProductInfoElement("stock");
    var ean = createProductInfoElement("ean");
    ean.classList.add("d-none");
    ean.classList.add("d-lg-table-cell");
    // url.appendChild(document.createTextNode(""));
    name.appendChild(document.createTextNode(""));
    price.appendChild(document.createTextNode(formatPrice(0)));
    stock.appendChild(generateStockColorBadge(0));
    ean.appendChild(document.createTextNode(""));
    // tr.appendChild(url);
    tr.appendChild(name);
    tr.appendChild(price);
    tr.appendChild(stock);
    tr.appendChild(ean);
    return tr;
}

/**
 * @param {string} url - the url string provided by SKROL
 * @returns {string} a re-formatted URL which can be handed to an <a> element
 */
function formatUrl(url) {
    if (url.includes("http://") || url.includes("https://")) {
        return url;
    } else if (url.includes("//")) {
        return url;
    } else {
        return "//" + url;
    }
}

/**
 * @param {Product} product the product to put into the element
 * @param {Element} entry the element to update
 * @returns {Element} the updatet TR-element
 */
function updateProductTrItem(product, entry) {
    var tr = entry;
    tr.id = "product_" + product.id;
    var childs = tr.childNodes;

    var nameHTML = "";
    var name = childs[0];
    if (product.url.trim().length !== 0) {
        product.url = formatUrl(product.url);
        nameHTML = "<a href='" + product.url + "' target='_blank'> <span><u>" + product.name + "</u></span> &nbsp; <span class='glyphicon glyphicon-new-window'></span></a>";
    } else {
        nameHTML = product.name;
    }
    name.innerHTML = nameHTML;

    var price = childs[1];
    price.childNodes[0].textContent = formatPrice(product.price);

    var stock = childs[2].childNodes[0];
    stock.classList.remove("badge-warning", "badge-success", "badge-danger");
    stock.classList.add(getStockColor(product.stock));
    stock.childNodes[0].textContent = product.stock;

    var ean = childs[3];
    ean.childNodes[0].textContent  = product.ean ? product.ean : "";

    return tr;
}

/**
 * put the list of products in the products-table
 *
 * @param {Product[]} products the element to parse
 */
function parseJSONasList(products) {
    var list = $("#productlist").find("tbody").get(0);
    while (list.childNodes.length > products.length) {
        list.removeChild(list.lastChild);
    }
    while (list.childNodes.length < products.length) {
        list.appendChild(createProductTrItem());
    }
    var childs = list.childNodes;

    var index = 0;
    for (var i in products) {
        updateProductTrItem(products[i], childs[index]);
        index++;
    }
}

/**
 * Generate an element to use in the representation of the amount in stock.
 *
 * @param {number} stock current amount of the product in stock
 * @returns {Element} the element to be used as a stock-indicator
 */
function generateStockColorBadge(stock) {
    var ret = getStockColor(stock);
    var el = document.createElement("span");
    el.classList.add("badge");
    el.classList.add(ret);
    el.appendChild(document.createTextNode(stock.toString()));
    return el;
}

/**
 * Returns color based on number of items in stock
 *
 * @param stock - The stock of an item
 * @returns {string}
 */
function getStockColor(stock) {
    if (stock <= 0) {
        return "badge-danger";
    } else if (stock < 3) {
        return "badge-warning";
    } else {
        return "badge-success";
    }
}

/**
 * Format the price to euros.
 *
 * @param {number} price the price to format
 * @returns {string} a string containing the formatted price
 */
function formatPrice(price) {
    return "€" + price.toFixed(2); // TODO: add currency support -- SKROL-support for currency is nescessary in that case
}

/**
 * Make an url using the base_url of the website, and the relative url specified in the js. JS alternative for
 * CodeIgniter"s base_url().
 *
 * @param {string} relativeUrl the URL relative to the web root
 * @param {string} append the url to append to the relative URL
 * @returns {string} the complete uri
 */
function makeFullUrl(relativeUrl, append) {
    if (append) {
        return window.base_url + relativeUrl + "/" + append;
    } else {
        return window.base_url + relativeUrl;
    }
}
