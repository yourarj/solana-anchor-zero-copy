use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_anchor_zero_copy {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn set_data(ctx: Context<SetData>, string_to_set: String) -> Result<()> {
        ctx.accounts
            .data_holder
            .greet_string
            .push_str(&string_to_set);

        msg!("greet string set successfully");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, seeds = [b"data_holder_v0", author.key().as_ref()], bump, payer=author, space= 10 * 1024 as usize)]
    pub data_holder: Account<'info, DataHolder>,
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DataHolder {
    pub greet_string: String,
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub data_holder: Account<'info, DataHolder>,
    #[account(mut)]
    pub writer: Signer<'info>,
}
