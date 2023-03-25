# PromptHub

## Note: This is broken with the latest release of Automatic1111 on March 25'th. This update broke a LOT of extensions. I'm working on a fix. [See this reddit post for more details](https://www.reddit.com/r/StableDiffusion/comments/121kqkd/psa_hold_up_with_updating_automatic1111_for_now/).

PromptHub is a prompt history and styles manager extension for Automatic1111.

The goal of this tool is to make iterating on prompts faster and more efficient by providing full prompt history management, as well as an improved experience for saving and maanging previous prompts.

Using this extension you will never forget a prompt again, have easy access to all of your saved prompts, be able to better manage your prompt collection, and even easily share specific prompt collections with others!

### Installation

Navigate to the extensions tab, select "Install from URL" and paste the URl for this repo into the entry box. Then go back to "Installed" and select "Apply and restart UI"

Repo URL: https://github.com/Zetaphor/PromptHub.git

### Feature Overview

![image](https://user-images.githubusercontent.com/3112763/227691648-9773fd84-f358-4da8-9d36-8e965f9e9d32.png)

There are three primary additions to the UI with this extension:

* Save/Delete buttons next to the positive/negative inputs
* The Prompt History Panel
* The Saved Prompts Panel

### Save/Delete Buttons

![image](https://user-images.githubusercontent.com/3112763/227691910-7a1c8cdc-bc0e-45e4-860d-49ecb357b910.png)

The top button allows you to manually save a positive/negative prompt to history. This is useful if you want to save a prompt to history without first generating an image from it.

The second button allows you to clear that prompt field, so only the positive or only the negative, rather than both witht the standard Automatic1111 delete button.

### Prompt History Panel

![image](https://user-images.githubusercontent.com/3112763/227692407-d4df077a-7b1c-4f1c-b774-d9520b28ef9d.png)

Every time you generate a new image in the txt2img or the img2img tab, the positive and negative prompt will be saved to the history list.
Duplicate generations of the same prompt will not be saved, only unique entries are saved to prevent clutter.

#### Saving History Items
The "Save Current X Prompt" button at the top allows you to save the currently entered positive/negative prompt in the txt2img or img2img tab to the Saved Prompts Panel.

Alternatively you can select an individual positive and negative prompt and use the "Save Selected History Prompts" button at the bottom to save the selected entries to the Saved Prompts Panel.

Choosing "Save Selected" under the positive or negative panel will allow you to create a new Saved Prompt that contains _only_ the positive or negative prompt you've selected.

#### Managing History

Clicking the + button will replace the current positive or negative prompt with the item you selected.

The Import and Export and export buttons allow you to save your history sessions to an external file.

You will be prompted for a filename and the history entries will be saved as `<filename>.prompt-history.json`.

In addition to being able to import/export session history, all history items are saved in browser cache and persist through page reloads.

### Saved Prompts Panel

![image](https://user-images.githubusercontent.com/3112763/227693954-f67665dd-f9ec-4bbc-8c83-b49911b4f240.png)

Selecting the name of a saved prompt from the list will show you both the positive and negative entry for that prompt.

You can then select one of the apply buttons to append the prompt value to the positive, negative, or both inputs.

Additionally you can export and import save prompts. You will be prompted for a filename, entries are saved in the format of `<filename>.prompts.json`.

Saved prompts are saved in the browser cache and will persist across page reloads.

A prompt can be edited by selecting its name and then modifying the contents in the positive or negative text entry fields. 

If the content in the field is unsaved, a button will appear asking if you want to override the prompts contents.
