﻿using AHPlugins;
using Hearthstone_Deck_Tracker;
using Hearthstone_Deck_Tracker.Hearthstone;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

// Ignore the warning, not every function needs an 'await'
#pragma warning disable 1998

// A test plugin that does something when cards are detected
// Reference ArenaHelper.dll and Hearthstone Deck Tracker
// Place the dll in ArenaHelper/plugins/ in the HDT plugins directory
// Only one plugin can be activated at a time
namespace HsasPlugin
{
    public class HsasPlugin : AHPlugin
    {
        private SemaphoreSlim mutex = new SemaphoreSlim(1);

        private string host = "http://localhost:9000";

        public override string Name
        {
            get { return "HsasPlugin"; }
        }

        public override string Author
        {
            get { return "Lajt"; }
        }

        public override Version Version
        {
            get { return new Version("0.0.1"); }
        }

        public HsasPlugin()
        {
            // Plugin constructor
            // Setup stuff
            Logger.WriteLine("HsasPlugin constructor");
        }

        // Called when three new cards are detected
        // arenadata: The previously detected cards, picked cards and heroes
        // newcards: List of 3 detected cards
        // defaultvalues: List of 3 tier values for the detected cards
        // Return a list of 3 card values and an optional 4th advice value
        public override async Task<List<string>> GetCardValues(ArenaHelper.Plugin.ArenaData arenadata, List<Card> newcards, List<string> defaultvalues)
        {
            List<string> values = new List<string>();

            // Add a test delay to simulate an API call
            //await Task.Delay(1000);
            
            // Add the three card values
            for (int i = 0; i < 3; i++)
            {
                // Add the prefix "p" to the default values as a test
                values.Add(defaultvalues[i]);
            }

            // Optionally add an advice as a 4th list element
            //values.Add("I don't know, pick one!");

            return values;
        }

        // Called when a new arena is started
        // arendata: As before
        public override async void NewArena(ArenaHelper.Plugin.ArenaData arenadata)
        {
            // Do something with the information
            Logger.WriteLine("New Arena: " + arenadata.deckname);
        }

        // Called when the heroes are detected
        // arendata: As before
        // heroname0: name of hero 0
        // heroname1: name of hero 1
        // heroname2: name of hero 2
        public override async void HeroesDetected(ArenaHelper.Plugin.ArenaData arenadata, string heroname0, string heroname1, string heroname2)
        {
            // Do something with the information
            Logger.WriteLine("Heroes Detected: " + heroname0 + ", " + heroname1 + ", " + heroname2);
            //var res = await MakeApiCall(host+ "/update/detected/" + heroname0+"/"+heroname1+"/"+heroname2);

        }

        // Called when a hero is picked
        // arendata: As before
        // heroname: name of the hero
        public override async void HeroPicked(ArenaHelper.Plugin.ArenaData arenadata, string heroname)
        {
            // Do something with the information
            Logger.WriteLine("Hero Picked: " + heroname);
            // /update/hero/:id
            var res = await MakeApiCall(host + "/update/hero/"+heroname);
        }

        // Called when the cards are detected
        // arendata: As before
        // card0: card 0
        // card1: card 1
        // card2: card 2
        public override async void CardsDetected(ArenaHelper.Plugin.ArenaData arenadata, Card card0, Card card1, Card card2)
        {
            // Do something with the information
            Logger.WriteLine("Cards Detected: " + card0.Name + ", " + card1.Name + ", " + card2.Name);
            var res = await MakeApiCall(host + "/update/detected/" + card0.Name + "/" + card1.Name + "/" + card2.Name);

        }

        // Called when a card is picked
        // arendata: As before
        // pickindex: index of the picked card in the range -1 to 2, if -1, no valid pick was detected
        // card: card information, null if invalid card
        public override async void CardPicked(ArenaHelper.Plugin.ArenaData arenadata, int pickindex, Card card)
        {
            // Ensure cards are added sequentially
            await mutex.WaitAsync();
            try
            {
                // Do something with the information
                string cardname = "";
                if (card != null)
                {
                    cardname = card.Name;
                }

                int cardcount = arenadata.pickedcards.Count;
                await Task.Delay(1000);

                // Be careful when manipulating values on the ArenaData as they might have changed while making your API calls
                bool changed = cardcount != arenadata.pickedcards.Count;

                Logger.WriteLine("Card Picked: " + cardname);
                // /update/card/:id
                var res = await MakeApiCall(host+ "/update/card/"+cardname);

            }
            finally
            {
                mutex.Release();
            }
        }

        // Called when all cards are picked
        // arendata: As before
        public override async void Done(ArenaHelper.Plugin.ArenaData arenadata)
        {
            // Do something with the information
            Logger.WriteLine("Done");
        }

        // Called when Arena Helper window is opened
        // arendata: As before
        // state: the current state of Arena Helper
        public override async void ResumeArena(ArenaHelper.Plugin.ArenaData arenadata, ArenaHelper.Plugin.PluginState state)
        {
            Logger.WriteLine("Resuming Arena");
            foreach (var cardid in arenadata.pickedcards)
            {
                Card card = ArenaHelper.Plugin.GetCard(cardid);
                string cardname = "-";
                if (card != null)
                {
                    cardname = card.Name;
                }
                Logger.WriteLine(cardname);
            }

            foreach (var heroname in arenadata.detectedheroes)
            {
                ArenaHelper.Plugin.HeroHashData hero = ArenaHelper.Plugin.GetHero(heroname);
                Logger.WriteLine("Detected hero: " + hero.name);
            }

            if (arenadata.pickedhero != "")
            {
                ArenaHelper.Plugin.HeroHashData hero = ArenaHelper.Plugin.GetHero(arenadata.pickedhero);
                Logger.WriteLine("Picked hero: " + hero.name);
            }

            Logger.WriteLine("State: " + ArenaHelper.Plugin.GetState().ToString());
        }

        // Called when Arena Helper window is closed
        // arendata: As before
        public override async void CloseArena(ArenaHelper.Plugin.ArenaData arenadata, ArenaHelper.Plugin.PluginState state)
        {
            // Closing the window, to maybe resume at a later time
            Logger.WriteLine("Closing");
        }

        private async Task<string> MakeApiCall(string param)
        {
            // Create a web client and specify a user agent
            WebClient webclient = new WebClient();
            string useragent = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20130401 Firefox/31.0";
            webclient.Headers.Add(HttpRequestHeader.UserAgent, useragent);

            // Make the call
            string page = await webclient.DownloadStringTaskAsync(param);

            // Return the results
            return page;
        }
    }
}