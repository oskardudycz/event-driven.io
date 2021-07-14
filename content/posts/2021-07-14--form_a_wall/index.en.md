---
title: Form a wall! And other concerns about security
category: "Coding Life"
cover: 2021-07-14-cover.png
author: oskar dudycz
---

![cover](2021-07-14-cover.png)

There were 0.3 seconds left till the end of the NBA match. Detroit Pistons were leading by a single point against San Antonio Spurs. The ball was in the hands of San Antonio players. As usually in basketball, the last seconds were interrupted by breaks for the coaches to set plays. Stan Van Gundy, Pistons' coach, had only one recipe:

**_"We just form a fucking wall!!!"_**

Check it out with the rest here:

`youtube: https://www.youtube.com/watch?v=YucvWt7CNn4`

The Wall was also built in the north from Winterfell. Even bigger than what the Pistons had set. Additionally, a magical one that could only be crossed overhead. Which in itself was an almost impossible task.

This wall had only one disadvantage. It was secured only on one side - the one from which attacks were expected. If someone walked over the Wall or attacked from the other side, then all was lost.

**When I started my career, SQL Injection and Cross-Site Scripting were perceived as sophisticated attacks.** Mature admins installed MSSQL servers with the Internet turned off, because by default, open to the world was a potential source of the attack. Setting up the firewall wasn't even a standard.

Today we have easier. By using the cloud, many things are warranted. Suppliers protect us from basic break-ins. For instance, they're blocking DDoS attacks and many other attacks that we don't even know existed. They put up a wall that is hard to breakthrough.

**However, some time ago, I found that the wall built by cloud providers may be similar to the one from Game of Thrones.** It's not an issue with cloud providers. It's an issue with us.

Trust in cloud security and the focus on the technical aspect of security make us feel too comfortable. We have HTTPS, OAuth, VPCs, and that's great. The issue is that too often, it makes us think that's enough.

I saw multiple times that security policies to resources like a database were defined without considerations. The application or module had all possible permissions. Instead of assigning only rights to required database schemas, files or operations, grants to all were given. Because of that, the website could get access to potentially everything. The typical answer when such a case was found: _"it's just an internal configuration, the API is secured"_. That's a classic example of ignorance and/or laziness.

Another case, more drastic. Website authenticated with certificates. **A pair of certificates shared by all clients.** Request signed in the application code and certificates compiled into the application code. Answer: _"The client would have to decompile it. That's likely not gonna happen."_ Yes, _that's not gonna happen_, a.k.a. Famous last words. If someone knows what to look for, it will be about 5 minutes to decompile it and find it. What can a clever, bored customer's developer do with a certificate compiled in your tool?

The other case is the application keys security. They are often used for integration. Unlike passwords, they are not rotated. They usually have a long lifecycle, and someone who has access to them can invoke our services.

Kevin Mitnick said **_"If an attacker wants to break into a system, the most effective approach is to try to exploit the weakest link - not operating systems, firewalls or encryption algorithms—but people"_**. It's still valid nowadays. The most vulnerable point in the security of our systems is us. We enter passwords such as daughter's name, qwerty etc. We put sticky notes with passwords on our monitors or save passwords in text files.

When creating applications, we usually have to make quality compromises. _"Okay, in this situation, system wil crash, but we can live with that."_ Security is not a place where we can do that. The consequences are much more severe. By definition, we should block user's actions and provide precisely what we allow.

Hackers usually look for security holes. When they find one, they keep digging. They will break through one wall and look for a gap in the next one. What if we only have one wall?

Then someone having a user password will get access to the endpoint and service logic. If we then allow the service to perform any action on the database, in theory, a person with access to the service can do anything with our data. Of course, we can say that _"only as much as the code allows"_. Well, but if the code has bugs and security holes? It doesn't have to be our code. What if the libraries we use have zero-day vulnerabilities? For example, see what could be done by specifying a binary string in Java: https://github.com/frohoff/ysoserial. Then think about what you can do with the scripted Java, for example, https://medium.com/intrinsic/common-node-js-attack-vectors-the-dangers-of-malicious-modules-863ae949e7e8.

**Another issue: test users.** Practically everyone has a _"qauser"_ with the password _"qwerty12345"_ or just _"test"_. Sometimes even a better password, but still one that everyone knows. As a rule, the password should not be changed because it is inconvenient. What if one of the employees is clever and has malicious intentions? Or he has been fired and is disappointed and wants to take revenge? What if it turns out that this user is also a cloud user (e.g. Azure AD) and other accesses within the system are directly assigned to him? What's worse if the user is an admin? When configuring such users, we often do not realize how much can be done with such a user.

Do you trust your coworkers? Great! What if we gave access to test users to our customers? Or we generated an access key that lasts a year? Will you also vouch for customer's employees? Yes? Will you also guarantee that the customer is secured correctly and no one intercepted these credentials?

Nowadays, advanced security methods are at your fingertips. We can even give every employee access to a password manager (e.g. [BitWarden](https://bitwarden.com/), [1Password](https://1password.com)). We can set 2-factor authentication, we can rotate passwords. We can cut off access immediately. The same with databases, we can do password rotations using tools like [Vault](https://www.vaultproject.io/). Each cloud provider has a similar built-in tool for that. The complexity of configuring that, even for on-premise solutions, is not high. Everything is possible.

However, what is the most difficult is thinking and being cautious about what we are doing. We have to be concerned about security. Some things can be done with a willingness to step up and following the basic rules.

**Therefore, before we grant access to any resources before we say that _"nobody will try that"_, let's think if this is really the wall we want to build.**

Cheers!

Oskar

p.s. if you liked this article, then you may also find interesting ["How money in Cloud impacts Architectural decisions?"](/en/how_money_in_cloud_impacts_architectural_decisions/)