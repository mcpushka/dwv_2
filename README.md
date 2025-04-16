# Data Wrangling and Visualisation. Assignment 2. Traffic visualisation.

## How to see:
Unfortunately, I was unable to wrap all sender, ask and frontend parts in docker containers. Please look at my code and tell me where the errors are. I'll be glad to know. However, there are ways to view my visualization:

- 1 way: 
1. First you need to start the server via terminal: 
    1. `cd PATH/to/the/project`. 
    2. `pip install flash flask-card`. 
    3. `python receiver.py`.

2. Start the data sender:
    1. check the `ip_address.csv` exists in the same directory as index.html
    2. `cd PATH/to/the/project`.
    3. Install dependencies: `pip install requests`.
    4. `python sender.py`.

3. Start the frontend:
`python -m http.server 8000`.

4. Logging in to the site: enter `http://localhost:8000` in the site address field

- 2 way:
- 
