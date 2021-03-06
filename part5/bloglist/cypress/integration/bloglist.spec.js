describe("Blog app", function() {
    beforeEach(function() {
        cy.request("POST", "http://localhost:3003/api/testing/reset")
        const user = {
            name: "test",
            username: "test",
            password: "test"
        }
        cy.request("POST", "http://localhost:3003/api/users/", user)
        const user2 = {
            name: "test2",
            username: "test2",
            password: "test2"
        }
        cy.request("POST", "http://localhost:3003/api/users/", user2)
        cy.visit("http://localhost:3000")
    })

    it("Login form is shown", function() {
        cy.contains("Log in to application")
    })

    describe("Login",function() {
        it("succeeds with correct credentials", function() {
            cy.get("#username-input").type("test")
            cy.get("#password-input").type("test")
            cy.get("#login-button").click()

            cy.contains("test logged in")
        })

        it("fails with wrong credentials", function() {
            cy.get("#username-input").type("ehehe")
            cy.get("#password-input").type("wrong")
            cy.get("#login-button").click()

            cy.contains("wrong credentials")
                .should("have.css", "color", "rgb(255, 0, 0)")

            cy.get("html").should("not.contain", "test logged in")
        })
    })

    describe("When logged in", function() {
        beforeEach(function() {
            cy.login({ username: "test", password: "test" })
        })

        it("A blog can be created", function() {
            cy.contains("new blog").click()
            cy.get("#title-input").type("a blog created by cypress")
            cy.get("#author-input").type("aucypress")
            cy.get("#url-input").type("https://cypress.com")
            cy.get("#addBlog-button").click()

            cy.contains("a blog created by cypress")
            cy.contains("aucypress")
        })

        describe("A blog already exists", function() {

            beforeEach(function () {
                cy.createBlog({ title: "first blog", author: "first author", url: "https://primo.com" })
                cy.createBlog({ title: "second blog", author: "second author", url: "https://secondo.com" })
            })

            it("A blog can be liked", function() {
                cy.contains("first blog").parent().as("firstBlog").parent()
                cy.get("@firstBlog").find("#viewBlog-button").click()
                cy.get("@firstBlog").find("#likeBlog-button").click()

                cy.get("@firstBlog").find("#likes").contains("1")
            })

            it("A blog can be deleted", function() {
                cy.contains("first blog").parent().as("firstBlog").parent()
                cy.get("@firstBlog").find("#viewBlog-button").click()
                cy.get("@firstBlog").find("#deleteBlog-button").click()

                cy.get("html").should("not.contain", "first blog")
            })

        })

        describe("Blog are like ordered", function() {
            beforeEach(function () {
                cy.createBlog({ title: "first blog", author: "first author", url: "https://primo.com" })
                cy.createBlog({ title: "second blog", author: "second author", url: "https://secondo.com" })
                cy.contains("first").find("#viewBlog-button").click()
                cy.contains("second").find("#viewBlog-button").click()
            })

            it.only("first more likes than second", function() {
                cy.contains("first").find("#likeBlog-button").click()
                cy.contains("first").find("#likeBlog-button").click()
                cy.contains("first").find("#likeBlog-button").click()
                cy.contains("first").find("#likeBlog-button").click()
                cy.contains("first").find("#likeBlog-button").click()
                cy.contains("first").find("#likeBlog-button").click()
                cy.contains("first").find("#likeBlog-button").click()

                cy.contains("second").find("#likeBlog-button").click()
                cy.contains("second").find("#likeBlog-button").click()
                cy.contains("second").find("#likeBlog-button").click()
                cy.contains("second").find("#likeBlog-button").click()
                cy.contains("second").find("#likeBlog-button").click()

                cy.get("span#likes").then( likes => {
                    const likesNumber = likes.toArray().map(el => el.innerText)
                    expect(likesNumber).to.deep.equal([...likesNumber].sort().reverse())
                })
            })

            it.only("second more likes than first", function() {
                cy.contains("first").find("#likeBlog-button").click()
                cy.contains("first").find("#likeBlog-button").click()
                cy.contains("first").find("#likeBlog-button").click()

                cy.contains("second").find("#likeBlog-button").click()
                cy.contains("second").find("#likeBlog-button").click()
                cy.contains("second").find("#likeBlog-button").click()
                cy.contains("second").find("#likeBlog-button").click()
                cy.contains("second").find("#likeBlog-button").click()

                cy.get("span#likes").then( likes => {
                    const likesNumber = likes.toArray().map(el => el.innerText)
                    expect(likesNumber).to.deep.equal([...likesNumber].sort().reverse())
                })
            })
        })

    })

    describe("Another user app", function() {

        it("Another user blog can't be deleted", function() {
            cy.login({ username: "test", password: "test" })
            cy.createBlog({ title: "second blog", author: "second author", url: "https://secondo.com" })
            cy.get("#logout-button").click()

            cy.login({ username: "test2", password: "test2" })
            cy.createBlog({ title: "third blog", author: "third author", url: "https://terzo.com" })
            cy.contains("second blog").parent().as("secondBlog").parent()

            cy.get("@secondBlog").should("not.contain", "#viewBlog-button")
            cy.get("html").should("contain", "second blog")
        })

    })

})